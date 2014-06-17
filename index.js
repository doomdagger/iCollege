// # Ghost bootloader
// Orchestrates the loading of Ghost
// When run from command line.

var iCollege = require('./core'),
    errors = require('./core/server/errors');

iCollege().then(function(){
     console.log("iCollege is running now...");
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});