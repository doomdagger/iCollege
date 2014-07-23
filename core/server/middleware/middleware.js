// # Custom Middleware
// The following custom middleware functions are all unit testable, and have accompanying unit tests in
// middleware_spec.js

var _           = require('lodash'),
    config      = require('../config'),
    path        = require('path'),
    fs          = require('fs'),
    busboy      = require('./icollege-busboy'),
    packageInfo = require('../../../package.json'),

    expressServer,
    ONE_HOUR_MS = 60 * 60 * 1000,
    ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;


function cacheServer(server) {
    expressServer = server;
}

var middleware = {

    // ### Authenticate Middleware
    // authentication has to be done for /api/* routes with
    // exceptions for signin, signout, signup, forgotten, reset only
    // api and frontend use different authentication mechanisms atm
    authenticate: function (req, res, next) {
        // all path should be regex
        var noAuthNeeded = [
                /^\/api\/v[0-9]+(\.[0-9]+)?\/signin\//,
                /^\/api\/v[0-9]+(\.[0-9]+)?\/forgotten\//,
                /^\/api\/v[0-9]+(\.[0-9]+)?\/signout\//,
                /^\/api\/v[0-9]+(\.[0-9]+)?\/reset\//
            ],
            path,
            subPath,
            index;

        // SubPath is the url path starting after any default subdirectories
        // it is stripped of anything after the three levels `/api/v0.1/.*?/` as the reset link has an argument
        path = req.path.substring(config().paths.subdir.length);
        /*jslint regexp:true, unparam:true*/
        subPath = path.replace(/^(\/.*?\/v[0-9]+(\.[0-9]+)?\/.*?\/)(.*)?/, function (match, a) {
            return a;
        });

        if (res.isRestful) {
            // if included in the no auth needed
            for (index in noAuthNeeded) {
                if (noAuthNeeded[index].test(subPath)) {
                    return next();
                }
            }
            return middleware.authAPI(req, res, next);
        }

        next();
    },

    // ## AuthApi Middleware
    // Authenticate a request to the API by responding with a 401 and json error details
    authAPI: function (req, res, next) {
        // validate username(id) and dynamic key against server's dynamic
        if (1 !== 1) {
            res.json(401, { success: false, reason: 'Please sign in' });
            return;
        }

        next();
    },

    // ## Restful API Version-ize
    versionAPI: function (req, res, next) {
        var path,
            apiIndex;

        if (res.isRestful) {
            path = req.path.substring(config().paths.subdir.length);

            if (!/^\/api\/v[0-9]+(\.[0-9]+)?\/(.*)?/.test(path)) {
                // api url does not have version
                apiIndex = req.url.indexOf('/api/');
                req.url = req.url.substring(0, apiIndex + 5) + "v" + config().api.version + "/" + req.url.substring(apiIndex + 5);
                req.originalUrl = req.url; // make the logger log correctly
            }
        }

        next();
    },

    // ### decideContext Middleware
    // Uses the URL to detect whether this response should be an admin response
    // This is used to ensure the right content is served, and is not for security purposes
    'decideContext' : function (req, res, next) {
        res.isRestful = req.url.lastIndexOf(config().paths.subdir + '/api/', 0) === 0;

//        if (res.isRestful) {
//            // if restful request, do something?
//            //console.log("is restful!!!")
//        } else {
//            // if not restful request, do something?
//
//        }

        // Pass 'secure' flag to the view engine
        // so that templates can choose 'url' vs 'urlSSL'
        res.locals.secure = req.secure;

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
    // when express enables some config, we can use this middleware, auto-config!
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
    },

    // ### Extend Properties
    // in Ghost, those properties are saved for template,
    // while in iCollege, we save them for api request
    'icollegeLocals': function (req, res, next) {
        // Make sure we have a locals value.
        res.locals = res.locals || {};
        res.locals.version = packageInfo.version;
        // relative path from the URL, not including subdir
        res.locals.relativeUrl = req.path.replace(config().paths.subdir, '');

        if (res.isRestful) {
//            when.all([
//                // api method needed to initialize any data
//            ]).then(function (values) {
//
//                _.extend(res.locals,  {
//                    // object to extend res.locals for successful initial
//                });
//                next();
//            }).catch(function () {
//                // Only show passive notifications
//                // objects to extend res.locals for passive initial
//                api.notifications.browse().then(function (notifications) {
//                    _.extend(res.locals, {
//                        messages: _.reject(notifications.notifications, function (notification) {
//                            return notification.status !== 'passive';
//                        })
//                    });
//                    // do not forget next()
            next();
//                });
//            });
        } else {
            next();
        }
    },

    // ### Robots Middleware
    // Handle requests to robots.txt and cache file
    'robots': function () {
        var content, // file cache
            filePath = path.join(config().paths.corePath, '/shared/robots.txt');

        return function robots(req, res, next) {
            if ('/robots.txt' === req.url) {
                if (content) {
                    res.writeHead(200, content.headers);
                    res.end(content.body);
                } else {
                    fs.readFile(filePath, function (err, buf) {
                        if (err) {
                            return next(err);
                        }

                        content = {
                            headers: {
                                'Content-Type': 'text/plain',
                                'Content-Length': buf.length,
                                'Cache-Control': 'public, max-age=' + ONE_YEAR_MS / 1000
                            },
                            body: buf
                        };
                        res.writeHead(200, content.headers);
                        res.end(content.body);
                    });
                }
            } else {
                next();
            }
        };
    },

    busboy: busboy
};

module.exports = middleware;
module.exports.cacheServer = cacheServer;
