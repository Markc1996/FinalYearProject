var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

//mongoose.connect ('mongodb+srv://Mark:<Password123>@cluster0-hxi5w.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect('mongodb://localhost:27017/FYP');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// Dashboard
router.get('/', ensureAuthenticated, (req, res) =>
    res.render('index', {
      user: req.user
    })
);

module.exports = router;
