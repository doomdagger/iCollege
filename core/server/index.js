// Module dependencies
var express     = require('express'),
    bodyParser  = require('body-parser'),
    compression = require('compression'),
    cookieParser= require('cookie-parser'),
    csurf       = require('csurf'),
    errorhandler= require('errorhandler'),
    session     = require('express-session'),
    RedisStore  = require('connect-redis')(session),
    methodOverride = require('method-override'),
    morgan      = require('morgan'),
    favicon     = require('serve-favicon'),
    serveStatic = require('serve-static'),
    fs          = require('fs'),
    uuid        = require('node-uuid'),
    Polyglot    = require('node-polyglot'),
    _           = require('lodash'),
    Q           = require('q'),

    config      = require('./config'),

    httpServer;



// ## Initializes the application.
// Sets up the express server instance.
// Finally it starts the http server.
function init(server) {
    var deferred = Q.defer();

    // If no express instance is passed in
    // then create our own
    if (!server) {
        server = express();
    }

    // Set up Polygot instance on the require module
    Polyglot.instance = new Polyglot();



    // enabled gzip compression by default
    server.use(compression());
    // override with http method having ?_method=DELETE or something else
    server.use(methodOverride('_method'));
    // Logging middleware for node.js http apps.
    server.use(morgan('dev'));
    // populate req.cookies
    server.use(cookieParser('i love u'));
    // populate req.session
    server.use(session({
        store: new RedisStore(config().database.redis.connection), // redis store
        secret: 'i love u'
    }));
    // ## populate req.body
    // parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded());
    // parse application/json
    server.use(bodyParser.json());
    // to handle errors and respond with content negotiation
    if (process.env.NODE_ENV === 'development') {
        server.use(errorhandler());
    }

    server.use(csurf());

    server.use(favicon(config().paths.clientPath + '/resources/icons/favicon.ico'));

    server.use(serveStatic(config().paths.clientPath, {
        index: ['index.html', 'index.htm']
    }));


    // ## Routing


    httpServer = server.listen(
        config().server.port,
        config().server.host
    );

    deferred.resolve(httpServer);

    return deferred.promise;
}

module.exports = init;
