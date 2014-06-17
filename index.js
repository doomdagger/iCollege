// # Ghost bootloader
// Orchestrates the loading of Ghost
// When run from command line.

var iCollege = require('./core'),
    path    = require('path'),
    errors = require('./core/server/errors');


iCollege({
    // give me your config.js path
    config: path.resolve(__dirname, 'config.js')
}).catch(function (err) {
    // log for the error and exit
    errors.logErrorAndExit(err, err.context, err.help);
});