// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var bodyParser     = require('body-parser'),
    config         = require('../config'),
    errors         = require('../errors'),
    express        = require('express'),
    logger         = require('morgan'),
    middleware     = require('./middleware'),
    path           = require('path'),
    routes         = require('../routes'),
    slashes        = require('connect-slashes'),
    storage        = require('../storage'),
    url            = require('url'),
    passport       = require('passport'),
    oauth          = require('./oauth'),
    oauth2orize    = require('oauth2orize'),
    authStrategies = require('./auth-strategies'),
    utils          = require('../utils'),

    app,
    setupMiddleware;

// ##Custom Middleware

// ### iCollegeLocals Middleware
// Expose the standard locals that every external page should have available,
// separating between the theme and the admin
function icollegeLocals(req, res, next) {
    // Make sure we have a locals value.
    res.locals = res.locals || {};
    res.locals.version = config.icollegeVersion;
    // relative path from the URL
    res.locals.relativeUrl = req.path;

    next();
}

// Detect uppercase in req.path
function uncapitalise(req, res, next) {
    var pathToTest = req.path,
        isAPI = req.path.match(/(\/icollege\/api\/v[\d\.]+\/.*?\/)/i);

    // Do not lowercase anything after /icollege/api/v0.1/ to protect :key/:slug
    if (isAPI) {
        pathToTest = isAPI[1];
    }

    if (/[A-Z]/.test(pathToTest)) {
        res.set('Cache-Control', 'public, max-age=' + utils.ONE_YEAR_S);
        res.redirect(301, req.url.replace(pathToTest, pathToTest.toLowerCase()));
    } else {
        next();
    }
}

function isSSLrequired() {
    return url.parse(config.url).protocol === 'https:';
}

// Check to see if we should use SSL
// and redirect if needed: redirect any request which does not use SSL
function checkSSL(req, res, next) {
    if (isSSLrequired()) {
        if (!req.secure) {
            var redirectUrl;

            redirectUrl = url.parse(config.urlSSL || config.url);
            return res.redirect(301, url.format({
                protocol: 'https:',
                hostname: redirectUrl.hostname,
                port: redirectUrl.port,
                pathname: req.path,
                query: req.query
            }));
        }
    }
    next();
}


setupMiddleware = function (appInstance) {
    var logging = config.logging,
        corePath = config.paths.corePath,
        oauthServer = oauth2orize.createServer();

    // silence JSHint without disabling unused check for the whole file
    authStrategies = authStrategies;

    // Cache express server instance
    app = appInstance;
    middleware.cacheApp(app);
    middleware.cacheOauthServer(oauthServer);
    oauth.init(oauthServer, middleware.resetSpamCounter);

    // Make sure 'req.secure' is valid for proxied requests
    // (X-Forwarded-Proto header will be checked, if present)
    app.enable('trust proxy');

    // Logging configuration
    if (logging !== false) {
        if (app.get('env') !== 'development') {
            app.use(logger('combined', logging));
        } else {
            app.use(logger('dev', logging));
        }
    }

    // Static assets
    app.use('/shared', express['static'](path.join(corePath, '/shared'), {maxAge: utils.ONE_HOUR_MS}));
    app.use('/content/images', storage.getStorage().serve());

    // Force SSL
    // NOTE: Importantly this is _after_ the check above for admin-theme static resources,
    //       which do not need HTTPS. In fact, if HTTPS is forced on them, then 404 page might
    //       not display properly when HTTPS is not available!
    app.use(checkSSL);


    // Add in all trailing slashes, properly include the subdir path
    // in the redirect.
    app.use(slashes(true, {
        headers: {
            'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S
        },
        base: config.paths.subdir
    }));
    app.use(uncapitalise);

    // Body parsing
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(passport.initialize());

    // ### Caching
    app.use(middleware.cacheControl('public'));
    app.use(routes.apiBaseUri, middleware.cacheControl('private'));

    // enable authentication
    app.use(middleware.authenticate);

    // local data
    app.use(icollegeLocals);

    // ### Routing
    // Set up API routes
    app.use('/icollege/api/v' + config.api.version + '/', routes.api(middleware));

    //### Error handling
    //404 Handler
    app.use(errors.error404);

    //500 Handler
    app.use(errors.error500);
};

module.exports = setupMiddleware;
// Export middleware functions directly
module.exports.middleware = middleware;
