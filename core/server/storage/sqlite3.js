// # sqlite3 Image Storage module
// The (not default) module for storing images, using the sqlite3 database

var express = require('express'),
    //nodefn  = require('when/node'),
    config  = require('../config'),
    _       = require('loDash'),
    BaseStore   = require('./base').BaseStore;

function SQLite3Store() {}

// 通过原型链实现继承
_.extend(SQLite3Store.prototype, BaseStore.prototype);

/**
 * Saves the image to storage (the file system)
 * @param {express.image} image - image is the express image object
 * @returns {promise} - returns a promise which ultimately returns the full url to the uploaded image
 */
SQLite3Store.prototype.save = function (image) {
    console.log("pending..." + image);
};

SQLite3Store.prototype.exists = function (filename) {
    console.log("pending..." + filename);
};

/**
 * middleware for serving the files
 * @returns {*}
 */
SQLite3Store.prototype.serve = function () {
    var ONE_HOUR_MS = 60 * 60 * 1000,
        ONE_YEAR_MS = 365 * 24 * ONE_HOUR_MS;

    // For some reason send divides the max age number by 1000
    return express['static'](config().paths.imagesPath, {maxAge: ONE_YEAR_MS});
};

module.exports.Store = SQLite3Store;