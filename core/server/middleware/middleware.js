// # Custom Middleware
// The following custom middleware functions are all unit testable, and have accompanying unit tests in
// middleware_spec.js

var _           = require('lodash'),
    express     = require('express'),
    config      = require('../config'),
    path        = require('path'),

    expressServer;
    //ONE_HOUR_MS = 60 * 60 * 1000,
    //ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;


function cacheServer(server) {
    expressServer = server;
}

var middleware = {

    // ## Test Middleware
    'test': function (req, res, next) {
        //console.log("from test middleware:" + req.url);

        next();
    },

    // ## AuthApi Middleware
    // Authenticate a request to the API by responding with a 401 and json error details
    'authAPI': function (req, res, next) {
        if (!req.session.user) {
            res.json(401, { error: 'Please sign in' });
            return;
        }

        next();
    },



    // ### CacheControl Middleware
    // provide sensible cache control headers
    'cacheControl': function (options) {
        /*jslint unparam:true*/
        var profiles = {
                'public': 'public, max-age=0',
                'private': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            },
            output;

        if (_.isString(options) && profiles.hasOwnProperty(options)) {
            output = profiles[options];
        }

        return function cacheControlHeaders(req, res, next) {
            if (output) {
                res.set({'Cache-Control': output});
            }
            next();
        };
    },

    // ### whenEnabled Middleware
    // Selectively use middleware
    // From https://github.com/senchalabs/connect/issues/676#issuecomment-9569658
    'whenEnabled': function (setting, fn) {
        return function settingEnabled(req, res, next) {
            // Set from server/middleware/index.js for now
            if (expressServer.enabled(setting)) {
                fn(req, res, next);
            } else {
                next();
            }
        };
    }


};

module.exports = middleware;
module.exports.cacheServer = cacheServer;
