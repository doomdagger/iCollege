// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var express     = require('express'),
    bodyParser  = require('body-parser'),
    cookieParser= require('cookie-parser'),
    errorhandler= require('errorhandler'),
    session     = require('express-session'),
    RedisStore  = require('connect-redis')(session),
    logger      = require('morgan'),
    favicon     = require('serve-favicon'),
    //serveStatic = require('serve-static'),
    config      = require('../config'),
    errors      = require('../errors'),
    fs          = require('fs'),
    middleware  = require('./middleware'),
    path        = require('path'),
    routes      = require('../routes'),
    //slashes     = require('connect-slashes'),
    storage     = require('../storage'),
    url         = require('url'),
    when        = require('when'),
    _           = require('lodash'),

    expressServer,
    ONE_HOUR_S  = 60 * 60,
    //ONE_YEAR_S  = 365 * 24 * ONE_HOUR_S,
    ONE_HOUR_MS = ONE_HOUR_S * 1000,
    ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;

// ##Custom Middleware

// ### Robots Middleware
// Handle requests to robots.txt and cache file
function robots() {
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
}

module.exports = function (server) {
    var logging = config().logging, // unresolved logging
        subdir = config().paths.subdir,
        corePath = config().paths.corePath,
        cookie;

    // Cache express server instance
    expressServer = server;
    middleware.cacheServer(expressServer);

    // Make sure 'req.secure' is valid for proxied requests
    // (X-Forwarded-Proto header will be checked, if present)
    expressServer.enable('trust proxy');

    // Logging configuration
    if (logging !== false) {
        if (expressServer.get('env') !== 'development') {
            expressServer.use(logger(logging || {}));
        } else {
            expressServer.use(logger(logging || 'dev'));
            // to handle errors and respond with content negotiation
            expressServer.use(errorhandler());
        }
    }

    // Favicon
    expressServer.use(subdir, favicon(corePath + '/client/resources/icons/favicon.ico'));

    // Static assets
    expressServer.use(subdir + '/shared', express['static'](path.join(corePath, '/shared'), {maxAge: ONE_HOUR_MS}));
    expressServer.use(subdir + '/content/images', storage.get_storage().serve());
    expressServer.use(subdir + '/app', express['static'](path.join(corePath, '/client'), {maxAge: ONE_YEAR_MS}));


    // Serve robots.txt if not found in theme
    expressServer.use(robots());

    // Add in all trailing slashes do not want to have the trailing slashes
    //expressServer.use(slashes(true, {headers: {'Cache-Control': 'public, max-age=' + ONE_YEAR_S}}));

    // Body parsing
    expressServer.use(bodyParser.json());
    expressServer.use(bodyParser.urlencoded());

    // ### Sessions
    // we need the trailing slash in the cookie path. Session handling *must* be after the slash handling
    cookie = {
        path: subdir + '/',
        maxAge: 12 * ONE_HOUR_MS
    };


    expressServer.use(cookieParser('i love u'));
    expressServer.use(session({
        store: new RedisStore(config().database.redis.connection), // redis store
        secret: 'i love u',
        proxy: true,
        cookie: cookie
    }));


    // ### Routing
    // Set up API routes
    expressServer.use(subdir, routes.user(middleware));

};

// Export middleware functions directly
module.exports.middleware = middleware;
