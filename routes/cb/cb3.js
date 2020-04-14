var express = require('express');
var router = express.Router();

/* GET completed builds 3 page. */
router.get('/', function(req, res, next) {
    res.render('cb3', { title: 'Express' });
});

module.exports = router;