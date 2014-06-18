var config        = require('../config'),
    _             = require('lodash'),
    path          = require('path'),
    when          = require('when'),
    errors        = require('../errors'),
    storage       = require('../storage'),

    user        = require('../models/user'),

    userControllers;

userControllers = {
    'index': function(req, res) {

        var lihe = new user.User({
            name: "lihe",
            password: "911119",
            email: "476282190@qq.com"
        });

        lihe.findSameNames(function(err, users){
            if(err)
                console.log(err);
            console.log(users);
        });

        res.send('hello you\nThe index page here.');

    }
};

module.exports = userControllers;