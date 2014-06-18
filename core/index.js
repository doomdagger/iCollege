// # Ghost bootloader
// Orchestrates the loading of Ghost
// When run from command line.

var when         = require('when'),
    bootstrap = require('./bootstrap');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function startICollege(options) {
    // When we no longer need to require('./server')
    // in a callback this extra deferred object
    // won't be necessary, we'll just be able to return
    // the server object directly.
    var deferred = when.defer();

    options = options || {};

    bootstrap(options.config).then(function () {
        try {
            var iCollege = require('./server');
            return iCollege(options.app)
                .then(deferred.resolve)
                .catch(function (e) {
                    // We don't return the rejected promise to stop
                    // the propogation of the rejection and just
                    // allow the user to manage what to do.
                    deferred.reject(e);
                });
        } catch (e) {
            deferred.reject(e);
        }
    });

    return deferred.promise;
}

module.exports = startICollege;