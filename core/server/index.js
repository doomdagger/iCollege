// Module dependencies
var express     = require('express'),
    compression = require('compression'),
    methodOverride = require('method-override'),
    Polyglot    = require('node-polyglot'),
    when        = require('when'),
    semver      = require('semver'),

    api         = require('./api'),
    migration   = require('./data/migration'),
    permissions = require('./permissions'),
    mailer      = require('./mail'),
    config      = require('./config'),
    packageInfo = require('../../package.json'),
    models      = require('./models'),
    middleware  = require('./middleware'),
    validation  = require('./data/validation'),

    httpServer;


// If we're in development mode, require "when/console/monitor"
// for help in seeing swallowed promise errors, and log any
// stderr messages from bluebird promises.
if (process.env.NODE_ENV === 'development') {
    require('when/monitor/console');
}

// do first run, send test mail to validate the email service
//function doFirstRun() {
//    return api.mail.sendTemplateTest().catch(function (error) {
//        console.log(
//            "Mail Test Faild - ".yellow,
//            error.message.red
//        );
//    });
//}

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
            config.url,
            "\nCtrl+C to shut down".grey
        );

        // ensure that Ghost exits correctly on Ctrl+C
        process.removeAllListeners('SIGINT').on('SIGINT', function () {
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
                config.server.host.yellow + ':' + config.server.port.yellow,
            "\nUrl configured as:",
                config.url,
            "\nCtrl+C to shut down".grey
        );
        // ensure that Ghost exits correctly on Ctrl+C
        process.removeAllListeners('SIGINT').on('SIGINT', function () {
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

// This is run after every initialization is done, right before starting server.
// Its main purpose is to move adding notifications here, so none of the submodules
// should need to include api, which previously resulted in circular dependencies.
// This is also a "one central repository" of adding startup notifications in case
// in the future apps will want to hook into here
function initNotifications() {
    if (mailer.state && mailer.state.usingSendmail) {
        console.log('INFO'.green, [
            "iCollege is attempting to use your server's <b>sendmail</b> to send e-mail.",
            "It is recommended that you explicitly configure an e-mail service,",
            "See <a href=\"http://support.ghost.org/mail\" target=\"_blank\">http://support.ghost.org/mail</a> for instructions"
        ].join('\n'));
    }
    if (mailer.state && mailer.state.emailDisabled) {
        console.log('WARN'.yellow, [
            "Ghost is currently unable to send e-mail.",
            "See <a href=\"http://support.ghost.org/mail\" target=\"_blank\">http://support.ghost.org/mail</a> for instructions"
        ].join('\n'));
    }
}

// ## Initializes the application.
// Sets up the express server instance.
// Instantiates the ghost singleton, helpers, routes, middleware, and apps.
// Finally it starts the http server.
function init(server) {

    // If no express instance is passed in
    // then create our own
    if (!server) {
        server = express();
    }

    // Set up Polygot instance on the require module
    Polyglot.instance = new Polyglot();

    // initialize validations
    validation.init();

    // connect to mongodb, render mongoose.connection
    return models.init().then(function () {
        // Initialize database
        return migration.init();

    }).then(function () {
        // Initialize the settings cache
        return api.init();

    }).then(function () {
        // Initialize the permissions actions and objects
        return permissions.init();

    }).then(function () {
        // Initialize mail
        return mailer.init();

    }).then(function () {
        var deferred = when.defer();

        // Output necessary notifications on init
        initNotifications();
        // ##Configuration

        // return the correct mime type for woff filess
        express['static'].mime.define({'application/font-woff': ['woff']});

        // enabled gzip compression by default
        if (config.server.compress !== false) {
            server.use(compression());
        }

        // override with http method having ?_method=DELETE or something else
        server.use(methodOverride('_method'));


        // ## Middleware and Routing
        middleware(server);

        httpServer = server.listen(
            config.server.port,
            config.server.host
        );

        httpServer.on('listening', function () {
            icollegeStartMessages();
            deferred.resolve(httpServer);
        });

        return deferred.promise;
    });


}

module.exports = init;
