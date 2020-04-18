var express = require('express');
var router = express.Router();
var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require('crypto');
var axios = require('axios');
const flatted = require('flatted');
var request = require('request');
var LocalStrategy = require('passport-local').Strategy;



/* GET page. */

router.get('/', function(req, res, next) {
    res.render('forgot1', { title: 'Express' });
});

module.exports = router;