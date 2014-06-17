/**
 * @module core/server/config
 * @type {exports}
 */

// General entry point for all configuration data
//
// This file itself is a wrapper for the root level config.js file.
// All other files that need to reference config.js should use this file.

var path          = require('path'), // built-in path module
    Q             = require('q'),   // q - promise implementation
    url           = require('url'), // built-in url module
    _             = require('lodash'),  // lodash
    configUrl     = require('./url'),// url.js in the same folder
    icollegeConfig   = {},
    appRoot       = path.resolve(__dirname, '../../../'), // the root of the project
    corePath      = path.resolve(appRoot, 'core/'), // the core folder
    clientPath    = path.resolve(corePath, 'client/'); // the client folder

/**
 * 传入一个config对象，用以升级 icollegeConfig对象
 * @param {Object} config - a config object most likely to be your config.js
 * @returns {{}}
 */
function updateConfig(config) {
    var localPath,
        contentPath,
        subdir;

    // Merge passed in config object onto
    // the cached icollegeConfig object
    _.merge(icollegeConfig, config);

    // Protect against accessing a non-existant object.
    // This ensures there's always at least a paths object
    // because it's referenced in multiple places.
    icollegeConfig.paths = icollegeConfig.paths || {};

    // Parse local path location, in config.example.js, url should be http://icollege.com, path should be '/'
    if (icollegeConfig.url) {
        localPath = url.parse(icollegeConfig.url).path;
        // Remove trailing slash
        if (localPath !== '/') {
            localPath = localPath.replace(/\/$/, '');
        }
    }

    subdir = localPath === '/' ? '' : localPath; // subdir == ''

    // Allow contentPath to be over-written by passed in config object
    // Otherwise default to default content path location
    contentPath = icollegeConfig.paths.contentPath || path.resolve(appRoot, 'content');

    _.merge(icollegeConfig, {
        paths: {
            'appRoot':          appRoot,
            'subdir':           subdir,
            'config':           icollegeConfig.paths.config || path.join(appRoot, 'config.js'),
            'configExample':    path.join(appRoot, 'config.example.js'),
            'corePath':         corePath,
            'clientPath':       clientPath,

            'contentPath':      contentPath,
            'appPath':          path.resolve(contentPath, 'apps'),
            'imagesPath':       path.resolve(contentPath, 'images'),
            'imagesRelPath':    'content/images',

            'exportPath':       path.join(corePath, '/server/data/export/'),
            'lang':             path.join(corePath, '/shared/lang/'),
            'debugPath':        subdir + '/icollege/debug/', // usage?

            'availableApps':    icollegeConfig.paths.availableApps || [],
            'builtScriptPath':  path.join(corePath, 'built/scripts/')
        }
    });

    // Also pass config object to
    // configUrl object to maintain
    // clean depedency tree
    configUrl.setConfig(icollegeConfig);

    return icollegeConfig;
}

function initConfig(rawConfig) {

    var deferred = Q.defer();

    // Cache the config.js object's environment
    // object so we can later refer to it.
    // Note: this is not the entirety of config.js,
    // just the object appropriate for this NODE_ENV
    icollegeConfig = updateConfig(rawConfig);

    // @TODO: deep search the apps in content/apps folder for available apps, should be returned as a promise
    deferred.resolve(icollegeConfig);

    return deferred.promise;
}

// Returns NODE_ENV config object
function config() {
    // @TODO: get rid of require statement.
    // This is currently needed for tests to load config file
    // successfully.  While running application we should never
    // have to directly delegate to the config.js file.
    if (_.isEmpty(icollegeConfig)) {
        try {
            icollegeConfig = require(path.resolve(__dirname, '../../../', 'config.js'))[process.env.NODE_ENV] || {};
        } catch (ignore) {/*jslint strict: true */}
        icollegeConfig = updateConfig(icollegeConfig);
    }

    return icollegeConfig;
}

module.exports = config;
module.exports.init = initConfig;
module.exports.urlFor = configUrl.urlFor;
module.exports.urlForPost = configUrl.urlForPost;
