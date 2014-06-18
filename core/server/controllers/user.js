var config        = require('../config'),
    _             = require('lodash'),
    path          = require('path'),
    when          = require('when'),
    errors        = require('../errors'),
    storage       = require('../storage'),

    userControllers;

userControllers = {
    'index': function(req, res) {

        res.send('hello you\nThe index page here.');

    }
};

module.exports = userControllers;