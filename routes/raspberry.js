var express = require('express');
var router = express.Router();

/* GET raspberry page. */
router.get('/', function(req, res, next) {
    res.render('raspberry', { title: 'Express' });
});

module.exports = router;