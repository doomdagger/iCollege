// Module dependencies
var express     = require('express'),
    compression = require('compression'),
    methodOverride = require('method-override'),
    Polyglot    = require('node-polyglot'),
    _           = require('lodash'),
    colors      = require('colors'),
    when        = require('when'),
    semver      = require('semver'),

    config      = require('./config'),
    packageInfo = require('../../package.json'),
    models      = require('./models'),
    middleware  = require('./middleware'),

    httpServer;


// If we're in development mode, require "when/console/monitor"
// for help in seeing swallowed promise errors, and log any
// stderr messages from bluebird promises.
if (process.env.NODE_ENV === 'development') {
    require('when/monitor/console');
}

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

    // If no express instance is passed in
    // then create our own
    if (!server) {
        server = express();
    }

    // Set up Polygot instance on the require module
    Polyglot.instance = new Polyglot();


    return models.init().then(function(){
        var deferred = when.defer();


        // return the correct mime type for woff filess
        express['static'].mime.define({'application/font-woff': ['woff']});

        // enabled gzip compression by default
        if (config().server.compress !== false) {
            server.use(compression());
        }

        // override with http method having ?_method=DELETE or something else
        server.use(methodOverride('_method'));


        // ## Middleware and Routing
        middleware(server);

        httpServer = server.listen(
            config().server.port,
            config().server.host
        );

        httpServer.on('listening', function () {
            icollegeStartMessages();
            deferred.resolve(httpServer);
        });

        return deferred.promise;
    });


}

module.exports = init;
