// This file manages the root level config.js.
// It will create config.js from config.exampe.js
// if it doesn't exist and then always attempt to load
// config.js into memory, error and quitting if config.js
// has an improper format.

var fs      = require('fs'),
    url     = require('url'),
    path    = require('path'),
    when       = require('when'),
    errors  = require('./server/errors'),
    config  = require('./server/config'),

    appRoot = path.resolve(__dirname, '../'),//app still not bootstrapped, cannot fetch app root from config module
    configExample = path.join(appRoot, 'config.example.js'),
    rejectMessage = 'Unable to load config',
    configFile;

function readConfigFile(envVal) {
    return require(configFile)[envVal];
}

function writeConfigFile() {
    var written = when.defer();

    /* Check for config file and copy from config.example.js
     if one doesn't exist. After that, start the server. */
    fs.exists(configExample, function checkTemplate(templateExists) {
        var read,
            write;

        if (!templateExists) {
            return errors.logError(new Error('Could not locate a configuration file.'), appRoot, 'Please check your deployment for config.js or config.example.js.');
        }

        // Copy config.example.js => config.js
        read = fs.createReadStream(configExample);
        read.on('error', function (/*error*/) {
            /*jshint unused:false*/
            return errors.logError(new Error('Could not open config.example.js for read.'), appRoot, 'Please check your deployment for config.js or config.example.js.');
        });
        read.on('end', written.resolve);

        write = fs.createWriteStream(configFile);
        write.on('error', function (/*error*/) {
            /*jshint unused:false*/
            return errors.logError(new Error('Could not open config.js for write.'), appRoot, 'Please check your deployment for config.js or config.example.js.');
        });

        read.pipe(write);
    });

    return written.promise;
}

function validateConfigEnvironment() {
    var envVal = process.env.NODE_ENV || undefined,
        hasHostAndPort,
        config,
        parsedUrl,
        deferred = when.defer();

    try {
        config = readConfigFile(envVal);
    } catch (ignore) {

    }

    // Check if we don't even have a config
    if (!config) {
        errors.logError(new Error('Cannot find the configuration for the current NODE_ENV'), "NODE_ENV=" + envVal,
            'Ensure your config.js has a section for the current NODE_ENV value and is formatted properly.');
        deferred.reject(rejectMessage);
    }

    // Check that our url is valid
    parsedUrl = url.parse(config.url || 'invalid', false, true);
    if (!parsedUrl.host) {
        errors.logError(new Error('Your site url in config.js is invalid.'), config.url, 'Please make sure this is a valid url before restarting');
        deferred.reject(rejectMessage);
    }


    // Check that we have database values
    if (!config.database) {
        errors.logError(new Error('Your database configuration in config.js is invalid.'), JSON.stringify(config.database), 'Please make sure this is a valid Bookshelf database configuration');
        deferred.reject(rejectMessage);
    }

    hasHostAndPort = config.server && !!config.server.host && !!config.server.port;

    // Check for valid server host and port values
    if (!config.server || !hasHostAndPort) {
        errors.logError(new Error('Your server values (socket, or host and port) in config.js are invalid.'), JSON.stringify(config.server), 'Please provide them before restarting.');
        deferred.reject(rejectMessage);
    }

    deferred.resolve(config);

    return deferred.promise;
}

/**
 * Bootstrap的入口方法，
 * @param configFilePath
 * @returns {*}
 */
function loadConfig(configFilePath) {
    var loaded = when.defer(),
        pendingConfig;

    // Allow config file path to be taken from, in order of importance:
    // environment process, passed in value, default location
    configFile = configFilePath;

    /* Check for config file and copy from config.example.js
     if one doesn't exist. After that, start the server. */
    fs.exists(configFile, function checkConfig(configExists) {
        if (!configExists) {
            pendingConfig = writeConfigFile();
        }
        when(pendingConfig).then(validateConfigEnvironment).then(function (rawConfig) {
            // add some path info to rawConfig
            rawConfig.paths.appRoot = appRoot;
            rawConfig.paths.configExample = configExample;
            rawConfig.paths.config = configFile;

            return config.init(rawConfig).then(loaded.resolve);
        }).catch(loaded.reject);
    });

    return loaded.promise;
}

module.exports = loadConfig;