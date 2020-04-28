var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var port = process.env.PORT || 8000;

var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require("multer-gridfs-storage");
const methodOverride = require('method-override');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const { stringify } = require('querystring');

//Init App
var app = express();

var mongoose = require('mongoose');


mongoose.connect ('mongodb+srv://Mark:markc96@cluster0-hxi5w.mongodb.net/FYP?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect('mongodb://localhost:27017/FYP');

//var db = mongoose.connection;

app.use(function(req,res,next){
  req.db = db;
  next();
});

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

/*
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Mark:<markc96>@cluster0-hxi5w.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: false });
client.connect(err => {
  const collection = client.db("FYP").collection("User");
  // perform actions on the collection object
  client.close();
});
*/


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var about = require('./routes/about');
var parts = require('./routes/parts');
var completedbuilds = require('./routes/completedbuilds');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var raspberryRouter = require('./routes/raspberry');
var profileRouter = require('./routes/profile');
var forgotRouter = require('./routes/forgot1');

//var articleRouter = require('./routes/articles');


//completed builds other pages
var cb1Router = require('./routes/cb/cb1');
var cb2Router = require('./routes/cb/cb2');
var cb3Router = require('./routes/cb/cb3');

var engine = require('ejs-mate');





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
//app.set('view engine', 'pug');

// BodyParsher Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//Article Middleware
//let Article = require('./models/article');

//Static Folder (images etc)
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ extended: true }));


//Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
})
);


//Express Validator
/*app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
   };
  }
}));
*/


// UPLOAD

// Create mongo connection
const conn = mongoose.createConnection('mongodb+srv://Mark:markc96@cluster0-hxi5w.mongodb.net/FYP?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});


// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: 'mongodb+srv://Mark:markc96@cluster0-hxi5w.mongodb.net/FYP?retryWrites=true&w=majority',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/profile', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('profile', { files: false });
    } else {
      files.map(file => {
        if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'  ||
            file.contentType === 'image/pdf'  ||
            file.contentType === 'image/tiff'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('profile', { files: files });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});


//Mail

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'imap.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'markuscarley@gmail.com', // generated ethereal user
      pass: 'rebecca19961996'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Node Mail Contact" <markcarley885@gmail.com>', // sender address
    to: 'markuscarley@gmail.com', // list of receivers
    subject: 'Node Contact Request', // Subject line
    text: 'Hello world?', // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('contact', {msg:'Email has been sent'});
  });
});





// Connect Flash
app.use(flash());

//passport init
app.use(passport.initialize());
app.use(passport.session());

//Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('/error');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/about',about);
app.use('/parts',parts);
app.use('/completedbuilds',completedbuilds);
app.use('/login',loginRouter);
app.use('/register',registerRouter);
app.use('/raspberry',raspberryRouter);
app.use('/profile', profileRouter);
app.use('/forgot1', forgotRouter);
//app.use('/article', articleRouter);

//completed builds app use
app.use('/cb1', cb1Router);
app.use('/cb2', cb2Router);
app.use('/cb3', cb3Router);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//config passport
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;


//Capta

app.post('/subscribe', async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: 'Please select captcha' });

  // Secret key
  const secretKey = '6LcZmu8UAAAAAHSbByPGkXeJ6SwYLjjdjHSqDUj2';

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: 'Failed captcha verification' });

  // If successful
  return res.json({ success: true, msg: 'Captcha passed' });
});



app.listen(port);
module.exports = app;
