var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    res.render('forgot1', { title: 'Express' });
});

module.exports = router;