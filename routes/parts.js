var express = require('express');
var router = express.Router();


/* GET parts page. */
router.get('/', function(req, res, next) {
    res.render('parts', { title: 'Express' });
});


module.exports = router;
