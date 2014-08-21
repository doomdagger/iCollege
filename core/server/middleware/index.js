// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var express     = require('express'),
    bodyParser  = require('body-parser'),
    errorhandler = require('errorhandler'),
    logger      = require('morgan'),
    favicon     = require('serve-favicon'),
    config      = require('../config'),
    middleware  = require('./middleware'),
    path        = require('path'),
    routes      = require('../routes'),
    slashes     = require('connect-slashes'),
    storage     = require('../storage'),
    errors       = require('../errors'),
    passport       = require('passport'),
    oauth          = require('./oauth'),
    oauth2orize    = require('oauth2orize'),
    authStrategies = require('./authStrategies'),
    utils          = require('../utils'),

    expressServer,
    setupMiddleware;



setupMiddleware = function (server) {
    var logging = config.logging, // unresolved logging
        subdir = config.paths.subdir,
        corePath = config.paths.corePath,
        oauthServer = oauth2orize.createServer();

    // make passport use several strategies
    authStrategies();

    // Cache express server instance
    expressServer = server;
    middleware.cacheServer(expressServer);
    middleware.cacheOauthServer(oauthServer);
    oauth.init(oauthServer, middleware.resetSpamCounter);

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
    expressServer.use(subdir + '/shared', express['static'](path.join(corePath, '/shared'), {maxAge: utils.ONE_HOUR_MS}));
    expressServer.use(subdir + '/content/images', storage.get_storage().serve());
    expressServer.use(subdir + '/app', express['static'](path.join(corePath, '/client'), {maxAge: utils.ONE_YEAR_MS}));
    expressServer.use(subdir + '/scripts', express['static'](path.join(corePath, '/built/scripts'), {maxAge: utils.ONE_YEAR_MS}));
    expressServer.use(subdir + '/public', express['static'](path.join(corePath, '/built/public'), {maxAge: utils.ONE_YEAR_MS}));


    // First determine whether we're serving api or other stuff
    expressServer.use(middleware.decideContext);
    // Version-ize api
    expressServer.use(middleware.versionAPI);
    // Force SSL
    // NOTE: Importantly this is _after_ the check above for admin-theme static resources,
    //       which do not need HTTPS. In fact, if HTTPS is forced on them, then 404 page might
    //       not display properly when HTTPS is not available!
    expressServer.use(middleware.checkSSL);
    // Serve robots.txt if not found in theme
    expressServer.use(middleware.robots());

    // Add in all trailing slashes, add this middleware after the static middleware
    expressServer.use(slashes(true, {headers: {'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S}}));

    // Body parsing
    expressServer.use(bodyParser.json());
    expressServer.use(bodyParser.urlencoded({ extended: true }));

    expressServer.use(passport.initialize());

    // ### Caching
    expressServer.use(middleware.cacheControl('public'));
    // #### API routing has private policy for caching
    expressServer.use(subdir + '/api/', middleware.cacheControl('private'));


    // ### Global authenticating
    // enable authentication; has to be done before CSRF handling
    expressServer.use(middleware.authenticate);

    // local data
    expressServer.use(middleware.icollegeLocals);
    
    // ### Routing
    // Set up API routes
    expressServer.use(subdir + routes.apiBaseUri, routes.api(middleware));

    // Set up User routes
    expressServer.use(subdir, routes.frontend(middleware));


    // ### Error handling
    // 404 Handler
    expressServer.use(errors.error404);

    // 500 Handler
    expressServer.use(errors.error500);
};

module.exports = setupMiddleware;
// Export middleware functions directly
module.exports.middleware = middleware;
