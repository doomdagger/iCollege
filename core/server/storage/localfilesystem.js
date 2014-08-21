// # Local File System Image Storage module
// The (default) module for storing images, using the local file system

var express = require('express'),
    fs      = require('fs-extra'),
    nodefn  = require('when/node'),
    path    = require('path'),
    when    = require('when'),
    _       = require('lodash'),
    errors  = require('../errors'),
    config  = require('../config'),
    BaseStore   = require('./base').BaseStore;


function LocalFileStore() {}

// 通过原型链实现继承
_.extend(LocalFileStore.prototype, BaseStore.prototype);


/**
 * Saves the image to storage (the file system)
 * @param {express.image} image - image is the express image object
 * @returns {promise} - returns a promise which ultimately returns the full url to the uploaded image
 */
LocalFileStore.prototype.save = function (image) {
    var saved = when.defer(),
        targetDir = this.getTargetDir(config.paths.imagesPath),
        targetFilename;

    this.getUniqueFileName(this, image, targetDir).then(function (filename) {
        targetFilename = filename;
        return nodefn.call(fs.mkdirs, targetDir);
    }).then(function () {
        return nodefn.call(fs.copy, image.path, targetFilename);
    }).then(function () {
        return nodefn.call(fs.unlink, image.path).catch(errors.logError);
    }).then(function () {
        // The src for the image must be in URI format, not a file system path, which in Windows uses \
        // For local file system storage can use relative path so add a slash
        var fullUrl = (config.paths.subdir + '/' + config.paths.imagesRelPath + '/' + path.relative(config.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');
        return saved.resolve(fullUrl);
    }).catch(function (e) {
        errors.logError(e);
        return saved.reject(e);
    });

    return saved.promise;
};

LocalFileStore.prototype.exists = function (filename) {
    // fs.exists does not play nicely with nodefn because the callback doesn't have an error argument
    var done = when.defer();

    fs.exists(filename, function (exists) {
        done.resolve(exists);
    });

    return done.promise;
};

/**
 * middleware for serving the files
 * @returns {*}
 */
LocalFileStore.prototype.serve = function () {
    var ONE_HOUR_MS = 60 * 60 * 1000,
        ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;

    // For some reason send divides the max age number by 1000
    return express['static'](config.paths.imagesPath, {maxAge: ONE_YEAR_MS});
};




module.exports.Store = LocalFileStore;