var config        = require('../config'),
    _             = require('lodash'),
    path          = require('path'),
    when          = require('when'),
    errors        = require('../errors'),
    storage       = require('../storage'),
    dataProvider  = require('../models'),

    userControllers;

userControllers = {
    'index': function(req, res) {

        dataProvider.User.findByName('lihe', function(err, users){
            if(err)
                res.send(err);
            else
                res.send(users);
        });


    }
};

module.exports = userControllers;