// # Ghost bootloader
// Orchestrates the loading of Ghost
// When run from command line.

var express,
    icollege,
    parentApp,
    errors;

// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

// Proceed with startup
express = require('express');
icollege = require('./core');
errors = require('./core/server/errors');

// Create our parent express app instance.
parentApp = express();

icollege().then(function (icollegeServer) {
    // Mount our icollege instance on our desired subdirectory path if it exists.
    parentApp.use(icollegeServer.config.paths.subdir, icollegeServer.rootApp);

    // Let icollege handle starting our server instance.
    icollegeServer.start(parentApp);
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});
