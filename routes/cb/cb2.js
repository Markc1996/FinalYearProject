var express = require('express');
var router = express.Router();

/* GET completed builds 2 page. */
router.get('/', function(req, res, next) {
    res.render('cb2', { title: 'Express' });
});

module.exports = router;