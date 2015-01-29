// Module dependencies
var express     = require('express'),
    compress    = require('compression'),
    methodOver  = require('method-override'),
    fs          = require('fs'),
    _           = require('lodash'),
    Promise     = require('bluebird'),

    api         = require('./api'),
    config      = require('./config'),
    errors      = require('./errors'),
    mailer      = require('./mail'),
    middleware  = require('./middleware'),
    migrations  = require('./data/migration'),
    models      = require('./models'),
    permissions = require('./permissions'),
    Server      = require('./icollege-server');


// 初次运行执行的逻辑应置于此
function doFirstRun() {
    //TODO: 初次运行入口方法



}

function initDbHashAndFirstRun() {
    //TODO: 我们需要DBHash吗

}

// This is run after every initialization is done, right before starting server.
// Its main purpose is to move adding notifications here, so none of the submodules
// should need to include api, which previously resulted in circular dependencies.
// This is also a "one central repository" of adding startup notifications in case
// in the future apps will want to hook into here
function initNotifications() {
    //TODO: 邮件系统的设置问题在这里打印出消息，我们打印到控制台

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
        return Promise.join(
            // Check for or initialise a dbHash.
            initDbHashAndFirstRun(),
            // Initialize mail
            mailer.init()
        );
    }).then(function () {
        // Output necessary notifications on init
        initNotifications();
        // ##Configuration

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
