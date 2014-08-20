// # Custom Middleware
// The following custom middleware functions are all unit testable, and have accompanying unit tests in
// middleware_spec.js

var _           = require('lodash'),
    path        = require('path'),
    fs          = require('fs'),
    passport    = require('passport'),
    url         = require('url'),

    busboy      = require('./icollege-busboy'),
    config      = require('../config'),
    packageInfo = require('../../../package.json'),
    errors      = require('../errors'),
    utils       = require('../utils'),

    expressServer,
    oauthServer,
    loginSecurity = [],
    forgottenSecurity = [];


function cacheServer(server) {
    expressServer = server;
}

function cacheOauthServer(server) {
    oauthServer = server;
}

var middleware = {

    // ### Authenticate Middleware
    // authentication has to be done for /api/* routes with
    // exceptions for signin, signout, signup, forgotten, reset only
    // api and frontend use different authentication mechanisms atm
    authenticate: function (req, res, next) {
        // all path should be regex
        var noAuthNeeded = [
                /^\/api\/v[0-9]+(\.[0-9]+)?\/authentication\//
            ],
            path,
            subPath,
            index;

        // SubPath is the url path starting after any default subdirectories
        // it is stripped of anything after the three levels `/api/v0.1/.*?/` as the reset link has an argument
        path = req.path.substring(config.paths.subdir.length);
        /*jslint regexp:true, unparam:true*/
        subPath = path.replace(/^(\/.*?\/v[0-9]+(\.[0-9]+)?\/.*?\/)(.*)?/, function (match, a) {
            return a;
        });

        if (res.isRestful) {
            // if included in the no auth needed
            for (index in noAuthNeeded) {
                if (noAuthNeeded.hasOwnProperty(index)) {
                    // We are sure that obj[key] belongs to the object and was not inherited.
                    if (noAuthNeeded[index].test(subPath)) {
                        return next();
                    }
                }
            }
            return passport.authenticate('bearer', { session: false, failWithError: true },
                function (err, user, info) {
                    if (err) {
                        return next(err); // will generate a 500 error
                    }
                    // Generate a JSON response reflecting authentication status
                    if (! user) {
                        var msg = {
                            success: false,
                            errors: ['Please Sign In'],
                            status: 'passive'
                        };
                        res.status(401);
                        return res.send(msg);
                    }
                    // TODO: figure out, why user & authInfo is lost
                    req.authInfo = info;
                    req.user = user;
                    return next(null, user, info);
                }
            )(req, res, next);
        }

        next();
    },

    // ## Restful API Version-ize
    versionAPI: function (req, res, next) {
        var path,
            apiIndex,
            apiStr = '/api/';

        if (res.isRestful) {
            // stripe out the subdir path
            path = req.path.substring(config.paths.subdir.length);

            if (!/^\/api\/v[0-9]+(\.[0-9]+)?\/(.*)?/.test(path)) {
                // api url does not have version
                apiIndex = req.url.indexOf(apiStr);
                // alter request path
                req.url = req.url.substring(0, apiIndex + apiStr.length) + "v" + config.api.version + "/" + req.url.substring(apiIndex + apiStr.length);
                // make the logger log correctly
                req.originalUrl = req.url;
            }
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

    // ### Spam prevention Middleware
    // limit signin requests to ten failed requests per IP per hour
    spamSigninPrevention: function (req, res, next) {
        var currentTime = process.hrtime()[0],
            remoteAddress = req.connection.remoteAddress,
            deniedRateLimit = '',
            ipCount = '',
            message = 'Too many attempts.',
            rateSigninPeriod = config.rateSigninPeriod || 3600,
            rateSigninAttempts = config.rateSigninAttempts || 10;

        if (req.body.username && req.body.grant_type === 'password') {
            // TODO: user email or uuid or _id or slug as our username
            loginSecurity.push({ip: remoteAddress, time: currentTime, email: req.body.username});
        } else if (req.body.grant_type === 'refresh_token') {
            return next();
        } else {
            return next(new errors.BadRequestError('No username.'));
        }

        // filter entries that are older than rateSigninPeriod
        loginSecurity = _.filter(loginSecurity, function (logTime) {
            return (logTime.time + rateSigninPeriod > currentTime);
        });

        // check number of tries per IP address
        ipCount = _.chain(loginSecurity).countBy('ip').value();
        deniedRateLimit = (ipCount[remoteAddress] > rateSigninAttempts);

        if (deniedRateLimit) {
            errors.logError(
                    'Only ' + rateSigninAttempts + ' tries per IP address every ' + rateSigninPeriod + ' seconds.',
                'Too many login attempts.'
            );
            message += rateSigninPeriod === 3600 ? ' Please wait 1 hour.' : ' Please try again later';
            return next(new errors.UnauthorizedError(message));
        }
        next();
    },

    // ### Spam prevention Middleware
    // limit forgotten password requests to five requests per IP per hour for different email addresses
    // limit forgotten password requests to five requests per email address
    spamForgottenPrevention: function (req, res, next) {
        var currentTime = process.hrtime()[0],
            remoteAddress = req.connection.remoteAddress,
            rateForgottenPeriod = config.rateForgottenPeriod || 3600,
            rateForgottenAttempts = config.rateForgottenAttempts || 5,
            email = req.body.passwordreset[0].email,
            ipCount = '',
            deniedRateLimit = '',
            deniedEmailRateLimit = '',
            message = 'Too many attempts.',
            index = _.findIndex(forgottenSecurity, function (logTime) {
                return (logTime.ip === remoteAddress && logTime.email === email);
            });

        if (email) {
            if (index !== -1) {
                forgottenSecurity[index].count = forgottenSecurity[index].count + 1;
            } else {
                forgottenSecurity.push({ip: remoteAddress, time: currentTime, email: email, count: 0});
            }
        } else {
            return next(new errors.BadRequestError('No email.'));
        }

        // filter entries that are older than rateForgottenPeriod
        forgottenSecurity = _.filter(forgottenSecurity, function (logTime) {
            return (logTime.time + rateForgottenPeriod > currentTime);
        });

        // check number of tries with different email addresses per IP
        ipCount = _.chain(forgottenSecurity).countBy('ip').value();
        deniedRateLimit = (ipCount[remoteAddress] > rateForgottenAttempts);

        if (index !== -1) {
            deniedEmailRateLimit = (forgottenSecurity[index].count > rateForgottenAttempts);
        }



        if (deniedEmailRateLimit) {
            errors.logError(
                    'Only ' + rateForgottenAttempts + ' forgotten password attempts per email every ' +
                    rateForgottenPeriod + ' seconds.',
                'Forgotten password reset attempt failed'
            );
        }

        if (deniedRateLimit) {
            errors.logError(
                    'Only ' + rateForgottenAttempts + ' tries per IP address every ' + rateForgottenPeriod + ' seconds.',
                'Forgotten password reset attempt failed'
            );
        }

        if (deniedEmailRateLimit || deniedRateLimit) {
            message += rateForgottenPeriod === 3600 ? ' Please wait 1 hour.' : ' Please try again later';
            return next(new errors.UnauthorizedError(message));
        }

        next();
    },
    resetSpamCounter: function (email) {
        loginSecurity = _.filter(loginSecurity, function (logTime) {
            return (logTime.email !== email);
        });
    },

    // work around to handle missing client_secret
    // oauth2orize needs it, but untrusted clients don't have it
    addClientSecret: function (req, res, next) {
        if (!req.body.client_secret) {
            req.body.client_secret = 'not_available';
        }
        next();
    },

    // ### Authenticate Client Middleware
    // authenticate client that is asking for an access token
    authenticateClient: function (req, res, next) {
        return passport.authenticate(['oauth2-client-password'], { session: false })(req, res, next);
    },

    // ### Generate access token Middleware
    // register the oauth2orize middleware for password and refresh token grants
    generateAccessToken: function (req, res, next) {
        return oauthServer.token()(req, res, next);
    },


    // ### decideContext Middleware
    // Uses the URL to detect whether this response should be an admin response
    // This is used to ensure the right content is served, and is not for security purposes
    'decideContext' : function (req, res, next) {
        res.isRestful = req.url.lastIndexOf(config.paths.subdir + '/api/', 0) === 0;

        // TODO: add logic for being capable of differentiating app operation and user operation

        next();
    },


    // ### Extend Properties
    // in Ghost, those properties are saved for template,
    // while in iCollege, we save them for api request
    'icollegeLocals': function (req, res, next) {
        // Make sure we have a locals value.
        res.locals = res.locals || {};
        res.locals.version = packageInfo.version;
        // relative path from the URL, not including subdir
        res.locals.relativeUrl = req.path.replace(config.paths.subdir, '');

//        if (res.isRestful) {
//            // TODO: Am I have some locals to insert into response?
//
//        }

        next();
    },

    // Check to see if we should use SSL
    // and redirect if needed
    checkSSL: function (req, res, next) {
        var parsedUrl = url.parse(config.urlSSL || config.url);
        if (parsedUrl.protocol === 'https:') {
            return res.redirect(301, url.format({
                protocol: 'https:',
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                pathname: req.path,
                query: req.query
            }));
        }
        next();
    },

    // ### Robots Middleware
    // Handle requests to robots.txt and cache file
    'robots': function () {
        var content, // file cache
            filePath = path.join(config.paths.corePath, '/shared/robots.txt');

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
                                'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_MS / 1000
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
module.exports.cacheOauthServer = cacheOauthServer;
