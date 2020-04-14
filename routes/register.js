var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'Express' });
});

//mongoose.connect  ('mongodb+srv://Mark:<markc96>@cluster0-hxi5w.mongodb.net/test?retryWrites=true&w=majority');
//mongoose.connect('mongodb://localhost:27017/FYP');

module.exports = router;