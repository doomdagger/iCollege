// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var express     = require('express'),
    bodyParser  = require('body-parser'),
    cookieParser = require('cookie-parser'),
    errorhandler = require('errorhandler'),
    session     = require('express-session'),
    redis       = require('redis'),
    RedisStore  = require('connect-redis')(session),
    logger      = require('morgan'),
    favicon     = require('serve-favicon'),
    config      = require('../config'),
    middleware  = require('./middleware'),
    path        = require('path'),
    routes      = require('../routes'),
    slashes     = require('connect-slashes'),
    storage     = require('../storage'),
    _           = require('lodash'),
    errors       = require('../errors'),

    expressServer,
    ONE_HOUR_S  = 60 * 60,
    ONE_YEAR_S  = 365 * 24 * ONE_HOUR_S,
    ONE_HOUR_MS = ONE_HOUR_S * 1000,
    ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;



module.exports = function (server) {
    var logging = config().logging, // unresolved logging
        subdir = config().paths.subdir,
        corePath = config().paths.corePath,
        redisInfo = config().database.redis.connection,
        cookie;

    // Cache express server instance
    expressServer = server;
    middleware.cacheServer(expressServer);

    // Make sure 'req.secure' is valid for proxied requests
    // (X-Forwarded-Proto header will be checked, if present)
    expressServer.enable('trust proxy');

    // development specific configuration

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


    // First determine whether we're serving api or other stuff
    expressServer.use(middleware.decideContext);

    // Serve robots.txt if not found in theme
    expressServer.use(middleware.robots());

    // Add in all trailing slashes, add this middleware after the static middleware
    expressServer.use(slashes(true, {headers: {'Cache-Control': 'public, max-age=' + ONE_YEAR_S}}));

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
        store: new RedisStore(_.merge({
                client: redis.createClient()
            }), redisInfo), // redis store
            proxy: true,
            secret: 'i love u',
            cookie: cookie
        }));


    // ### Caching
    expressServer.use(middleware.cacheControl('public'));
    // #### API routing has private policy for caching
    expressServer.use(subdir + '/api/', middleware.cacheControl('private'));

    // ### Version-ize api
    expressServer.use(middleware.versionAPI);

    // ### Global authenticating
    // enable authentication; has to be done before CSRF handling
    expressServer.use(middleware.authenticate);

    // local data
    expressServer.use(middleware.icollegeLocals);
    
    // ### Routing
    // Set up API routes
    expressServer.use(subdir, routes.api(middleware));

    // Set up User routes
    expressServer.use(subdir, routes.user(middleware));


    // ### Error handling
    // 404 Handler
    expressServer.use(errors.error404);

    // 500 Handler
    expressServer.use(errors.error500);
};

// Export middleware functions directly
module.exports.middleware = middleware;
