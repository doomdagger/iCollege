/**
 * Created by psicat on 2015/4/4.
 */
var cp         = require('child_process'),
    _          = require('lodash'),
    fs         = Promise.promisifyAll(require('fs')),
    url        = require('url'),
    net        = require('net'),
    Promise    = require('bluebird'),
    path       = require('path'),
    config     = require('../../server/config');

// to fork another process of icollege server ...
// ... we need find a free port first
function findFreePort(port) {
    return new Promise(function (resolve, reject) {
        // if a beginning port is given correctly ...
        // ... then we should accept it ...
        if(typeof port === 'string') {
            port = parseInt(port);
        }
        // ... but if not, free port finding process will predict that  ...
        // ... there is only one icollege server running on default port(1222) ...
        // ... and free port finding will begin at 1223
        if(typeof port !== 'number') {
            port = 1222;
        }

        // if current port is unavailable, we should try next port
        port += 1;

        // to confirm a port is free, we can try to startup an empty server
        var server = net.createServer();

        server.on('error', function (error) {
            // error code EADDRINUSE means the port is busy ...
            if(error.code === 'EADDRINUSE') {
                // ... and we need to try next port
                resolve(findFreePort(port));
            } else {
                reject(error);
            }
        });
        server.listen(port, function () {
            var listenPort = server.address().port;
            // here we can see the listenPort is available ...
            // ... we should shutdown dummy server and send port back
            server.close(function () {
                resolve(listenPort);
            });
        });
    });
}

// Get a copy of current config object from file, to be modified before
// passing to forkGhost() method
function forkConfig() {
    // require caches values, and we want to read it fresh from the file
    delete require.cache[config.paths.config];
    return _.cloneDeep(require(config.paths.config)[process.env.NODE_ENV]);
}

function forkICollege(newConfig, envName) {
    envName = envName || 'forked';

    return findFreePort(newConfig.server ? newConfig.server.port : undefined)
        .then(function (port) {
        newConfig.server = newConfig.server || {};
        newConfig.server.port = port;
        newConfig.url = url.format(_.extend(url.parse(newConfig.url), {port: port, host: null}));

        var newConfigFile = path.join(config.paths.appRoot, 'config.test' + port + '.js');

        return new Promise(function (resolve, reject) {
            // save provided config into a config.js ...
            fs.writeFileAsync(newConfigFile, 'module.exports = {' + envName + ': ' + JSON.stringify(newConfig) + '}')
                .then(function () {
                    // and setup environment for forked iCollege
                    var env = _.clone(process.env),
                        baseKill,
                        child,
                        pingTries = 0,
                        pingCheck,
                        pingStop = function () {
                            if (pingCheck) {
                                clearInterval(pingCheck);
                                pingCheck = undefined;
                                return true;
                            }
                            return false;
                        };
                    env.ICOLLEGE_CONFIG = newConfigFile;
                    env.NODE_ENV = envName;
                    child = cp.fork(path.join(config.paths.appRoot, 'index.js'), {env: env});
                    child.port = port;

                    pingCheck = setInterval(function () {
                        var socket = net.connect(port);
                        socket.on('connect', function () {
                            socket.end();
                            if (pingStop()) {
                                resolve(child);
                            }
                        });
                        socket.on('error', function (err) {
                            /*jshint unused:false*/
                            pingTries = pingTries + 1;
                            // continue checking
                            if (pingTries >= 50 && pingStop()) {
                                child.kill();
                                reject(new Error('Timed out waiting for child process'));
                            }
                        });
                    }, 200);


                    child.on('exit', function (code, signal) {
                        /*jshint unused:false*/
                        child.exited = true;

                        fs.unlink(newConfigFile, function () {
                            // swallow any errors -- file may not exist if fork() failed
                        });

                        if (pingStop()) {
                            reject(new Error('Child process exit code: ' + code));
                        }
                    });

                    // override kill() to have an async callback
                    baseKill = child.kill;
                    child.kill = function (signal, cb) {
                        if (typeof signal === 'function') {
                            cb = signal;
                            signal = undefined;
                        }

                        if (cb) {
                            child.on('exit', function () {
                                cb();
                            });
                        }

                        if (child.exited) {
                            process.nextTick(cb);
                        } else {
                            baseKill.apply(child, [signal]);
                        }
                    }
                }).catch(function (error) {
                reject(error);
            });
        });
    });
}
modules.exports = {
    forkConfig: forkConfig,
    forkICollege: forkICollege
};