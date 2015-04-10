// Module dependencies
var express     = require('express'),
    compress    = require('compression'),
    methodOver  = require('method-override'),

    api         = require('./api'),
    config      = require('./config'),
    mailer      = require('./mail'),
    middleware  = require('./middleware'),
    migrations  = require('./data/migration'),
    models      = require('./models'),
    permissions = require('./permissions'),
    Server      = require('./icollege-server');



// This is run after every initialization is done, right before starting server.
// Its main purpose is to move adding notifications here, so none of the submodules
// should need to include api, which previously resulted in circular dependencies.
// This is also a "one central repository" of adding startup notifications in case
// in the future apps will want to hook into here
function initNotifications() {
    if (mailer.state && mailer.state.usingDirect) {
        console.log(
                'iCollege is attempting to use a direct method to send e-mail.'.green,
                '\nIt is recommended that you explicitly configure an e-mail service.'.green
        );
    }
    if (mailer.state && mailer.state.emailDisabled) {
        console.log(
                'iCollege is currently unable to send e-mail.'.yellow
        );
    }
}

// ## Initializes the application.
// Sets up the express server instance.
// Instantiates the icollege singleton, helpers, routes, middleware, and apps.
// Finally it starts the http server.
function init(options) {
    // Get reference to an express app instance.
    var app = express();

    // ### Initialisation
    // The server and its dependencies require a populated config
    // It returns a promise that is resolved when the application
    // has finished starting up.

    // Load our config.js file from the local file system.
    return config.load(options.config).then(function () {
        return config.checkDeprecated();
    }).then(function () {
        // Initialise the models
        return models.init();
    }).then(function () {
        // Initialize migrations
        return migrations.init();
    }).then(function () {
        // Populate any missing default settings
        return models.Settings.populateDefaults();
    }).then(function () {
        // Initialize the settings cache
        return api.init();
    }).then(function () {
        // Initialize the permissions actions and objects
        // NOTE: Must be done before initDbHashAndFirstRun calls
        return permissions.init();
    }).then(function () {
        // Initialize mail
        return mailer.init();
    }).then(function () {
        // Output necessary notifications on init
        initNotifications();
        // ##Configuration

        // return the correct mime type for woff filess
        express['static'].mime.define({'application/font-woff': ['woff']});

        // enabled gzip compression by default
        if (config.server.compress !== false) {
            app.use(compress());
        }

        // override with http method having ?_method=DELETE or something else
        app.use(methodOver('_method'));

        // ## Middleware and Routing
        middleware(app);

        return new Server(app);
    });
}

module.exports = init;
