var express = require('express');
var router = express.Router();

/* GET completed builds 1 page. */
router.get('/', function(req, res, next) {
    res.render('cb1', { title: 'Express' });
});

module.exports = router;