// # iCollege Server Object
// Very Important! 此模块定义Server Object的所有行为，讲Server的行为封装在此类中，操作方便。

var Promise = require('bluebird'),
    fs = require('fs'),
    semver = require('semver'),
    packageInfo = require('../../package.json'),
    errors = require('./errors'),
    config = require('./config');

function Server(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.connections = {};
    this.connectionId = 0;
    this.upgradeWarning = setTimeout(this.logUpgradeWarning.bind(this), 5000);

    // Expose config module for use externally.
    this.config = config;
}

Server.prototype.connection = function (socket) {
    var self = this;

    self.connectionId += 1;
    socket._icollegeId = self.connectionId;

    socket.on('close', function () {
        delete self.connections[this._icollegeId];
    });

    self.connections[socket._icollegeId] = socket;
};

// Most browsers keep a persistent connection open to the server
// which prevents the close callback of httpServer from returning
// We need to destroy all connections manually
Server.prototype.closeConnections = function () {
    var self = this;

    Object.keys(self.connections).forEach(function (socketId) {
        var socket = self.connections[socketId];

        if (socket) {
            socket.destroy();
        }
    });
};

Server.prototype.logStartMessages = function () {
    // Tell users if their node version is not supported, and exit
    if (!semver.satisfies(process.versions.node, packageInfo.engines.node)) {
        console.log(
            '\nERROR: Unsupported version of Node'.red,
            '\niCollege needs Node version'.red,
            packageInfo.engines.node.yellow,
            'you are using version'.red,
            process.versions.node.yellow,
            '\nPlease go to http://nodejs.org to get a supported version'.green
        );

        process.exit(0);
    }

    // Startup & Shutdown messages
    if (process.env.NODE_ENV === 'production') {
        console.log(
            'iCollege is running...'.green,
            '\nYour host is now available on',
            config.url,
            '\nCtrl+C to shut down'.grey
        );
    } else {
        console.log(
            ('iCollege is running in ' + process.env.NODE_ENV + '...').green,
            '\nListening on',
                config.getSocket() || config.server.host + ':' + config.server.port,
            '\nUrl configured as:',
            config.url,
            '\nCtrl+C to shut down'.grey
        );
    }

    function shutdown() {
        console.log('\niCollege has shut down'.red);
        if (process.env.NODE_ENV === 'production') {
            console.log(
                '\nYour host is now offline'
            );
        } else {
            console.log(
                '\niCollege was running for',
                Math.round(process.uptime()),
                'seconds'
            );
        }
        process.exit(0);
    }
    // ensure that iCollege exits correctly on Ctrl+C and SIGTERM
    process.
        removeAllListeners('SIGINT').on('SIGINT', shutdown).
        removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

Server.prototype.logShutdownMessages = function () {
    console.log('iCollege is closing connections'.red);
};

Server.prototype.logUpgradeWarning = function () {
    errors.logWarn(
        'iCollege no longer starts automatically when using it as an npm module.',
        'If you\'re seeing this message, you may need to update your custom code.',
        'Please see the docs at http://tinyurl.com/npm-upgrade for more information.'
    );
};

/**
 * Starts the icollege server listening on the configured port.
 * Alternatively you can pass in your own express instance and let iCollege
 * start lisetning for you.
 * @param  {Object=} externalApp Optional express app instance.
 * @return {Promise}
 */
Server.prototype.start = function (externalApp) {
    var self = this,
        rootApp = externalApp ? externalApp : self.rootApp;

    // ## Start iCollege App
    return new Promise(function (resolve) {
        if (config.getSocket()) {
            // Make sure the socket is gone before trying to create another
            try {
                fs.unlinkSync(config.getSocket());
            } catch (e) {
                // We can ignore this.
            }

            self.httpServer = rootApp.listen(
                config.getSocket()
            );

            fs.chmod(config.getSocket(), '0660');
        } else {
            self.httpServer = rootApp.listen(
                config.server.port,
                config.server.host
            );
        }

        self.httpServer.on('error', function (error) {
            if (error.errno === 'EADDRINUSE') {
                errors.logError(
                    '(EADDRINUSE) Cannot start iCollege.',
                    'Port ' + config.server.port + ' is already in use by another program.',
                    'Is another iCollege instance already running?'
                );
            } else {
                errors.logError(
                    '(Code: ' + error.errno + ')',
                    'There was an error starting your server.',
                    'Please use the error code above to search for a solution.'
                );
            }
            process.exit(-1);
        });
        self.httpServer.on('connection', self.connection.bind(self));
        self.httpServer.on('listening', function () {
            self.logStartMessages();
            clearTimeout(self.upgradeWarning);
            resolve(self);
        });
    });
};

// Returns a promise that will be fulfilled when the server stops.
// If the server has not been started, the promise will be fulfilled
// immediately
Server.prototype.stop = function () {
    var self = this;

    return new Promise(function (resolve) {
        if (self.httpServer === null) {
            resolve(self);
        } else {
            self.httpServer.close(function () {
                self.httpServer = null;
                self.logShutdownMessages();
                resolve(self);
            });

            self.closeConnections();
        }
    });
};

// Restarts the icollege application
Server.prototype.restart = function () {
    return this.stop().then(this.start.bind(this));
};

// To be called after `stop`
Server.prototype.hammertime = function () {
    console.log('Can\'t touch this'.green);

    return Promise.resolve(this);
};

module.exports = Server;
