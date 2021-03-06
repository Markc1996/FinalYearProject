var express = require('express');
var router = express.Router();
var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require('crypto');
var axios = require('axios');
const flatted = require('flatted');
var request = require('request');
const User = require('../models/User');
var LocalStrategy = require('passport-local').Strategy;



/* GET page. */

router.get('/', function(req, res) {
    res.render('forgot1', {
        user: req.user
    });
});

router.post('/', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/login');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var transporter = nodemailer.createTransport({
                service: '\t\n' + 'imap.gmail.com',
                port: 993,
                secure: false,
                auth: {

                    user: 'markuscarley@gmail.com',
                    pass: 'rebecca19961996//'


                },
                tls: {
                    rejectUnathorized: false
                }
            });




            var mailOptions = {
                to: user.email,
                from: '"Mark Carley" <markuscarley@gmail.com' ,
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            transporter.sendMail(mailOptions, function(err) {

                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });


        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
});


router.get('/reset/:token', function(req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('#/forgot1');
        }
        res.render('reset', {token: req.params.token});
    });

});


router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('login');
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var transporter = nodemailer.createTransport({
                service: '\t\n' +
                    'imap.gmail.com',
                port: 993,
                secure: false,
                auth: {

                    user: 'markuscarley@gmail.com',
                    pass: 'rebecca19961996'


                },
                tls: {
                    rejectUnathorized: false
                }
            });




            var mailOptions = {
                to: user.email,
                from: '"Mark Carley" <markuscarley@gmail.com' ,
                subject: 'Your password has been changed',
                text:  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };


            transporter.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);

            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
});


module.exports = router;