/**
 * Database operations for mongodb
 * We do not have other choices for database, so this file
 * is dedicated to mongodb only.
 * Created by Li He on 2014/7/25.
 */


var mongoose    = require('mongoose'),
    when        = require('when');

/**
 * Pass collection Name in:
 * e.g. settings users apps etc.
 * to create collection
 * @param collectionName
 */
function createCollection(collectionName) {
    var deferred = when.defer();
    mongoose.connection.db.createCollection(collectionName, function (err, collection) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(collection);
    });
    return deferred.promise;
}

/**
 * Pass collection Name in:
 * e.g. settings users apps etc.
 * to drop collection
 * @param collectionName
 */
function dropCollection(collectionName) {
    var deferred = when.defer();
    mongoose.connection.db.dropCollection(collectionName, function (err, ret) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(ret);
    });
    return deferred.promise;
}

/**
 * Get All Collections' Names
 * @returns {Promise}
 */
function collectionNames() {
    var deferred = when.defer();
    mongoose.connection.db.collectionNames(function (err, names) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(names);
    });
    return deferred.promise;
}


/**
 * collections - objects
 * @returns {Promise}
 */
function collections() {
    var deferred = when.defer();
    mongoose.connection.db.collections(function (err, collections) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(collections);
    });
    return deferred.promise;
}

module.exports = {
    createCollection: createCollection,
    dropCollection: dropCollection,
    collectionNames: collectionNames,
    collections: collections
};