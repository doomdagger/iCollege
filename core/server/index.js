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
    colors      = require('colors'),
    Q           = require('q'),
    semver      = require('semver'),

    config      = require('./config'),
    packageInfo = require('../../package.json'),
    httpServer;


function icollegeStartMessages() {
    // Tell users if their node version is not supported, and exit
    if (!semver.satisfies(process.versions.node, packageInfo.engines.node)) {
        console.log(
            "\nERROR: Unsupported version of Node".red,
            "\niCollege needs Node version".red,
            packageInfo.engines.node.yellow,
            "you are using version".red,
            process.versions.node.yellow,
            "\nPlease go to http://nodejs.org to get a supported version".green
        );

        process.exit(0);
    }

    // Startup & Shutdown messages
    if (process.env.NODE_ENV === 'production') {
        console.log(
            "iCollege is running...".green,
            "\nYour site is now available on",
            config().url,
            "\nCtrl+C to shut down".grey
        );

        // ensure that Ghost exits correctly on Ctrl+C
        process.on('SIGINT', function () {
            console.log(
                "\niCollege has shut down".red,
                "\nYour site is now offline"
            );
            process.exit(0);
        });
    } else {
        console.log(
            ("iCollege is running in " + process.env.NODE_ENV + "...").green,
            "\nListening on",
                config().server.host.yellow + ':' + config().server.port.yellow,
            "\nUrl configured as:",
                config().url,
            "\nCtrl+C to shut down".grey
        );
        // ensure that Ghost exits correctly on Ctrl+C
        process.on('SIGINT', function () {
            console.log(
                "\niCollege has shutdown".red,
                "\niCollege was running for",
                Math.round(process.uptime()),
                "seconds"
            );
            process.exit(0);
        });
    }
}



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

    server.use(favicon(config().paths.clientPath + '/resources/icons/favicon.ico'));

    server.use(serveStatic(config().paths.clientPath, {
        index: ['index.html', 'index.htm']
    }));


    // ## Routing Example
    server.get('/hello', function(req, res){
        //console.log(req.query.name);
        res.send('Hello World');
    });

    httpServer = server.listen(
        config().server.port,
        config().server.host
    );

    httpServer.on('listening', function () {
        icollegeStartMessages();
        deferred.resolve(httpServer);
    });


    return deferred.promise;
}

module.exports = init;
