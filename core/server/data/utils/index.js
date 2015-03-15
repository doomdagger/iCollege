/**
 * Database operations only for mongodb.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/22.
 */



var mongoose    = require('mongoose'),
    Promise     = require('bluebird'),
    //sequence    = require('bluebird/sequence'),
    _           = require('lodash'),

    db = mongoose.connection.db;


var operations = {
    /**
     * Create Collection with specified property
     * @param [collectionName] (string) – the collection name we wish to filter by.
     * @param [options] (object) – returns option results.
     */
    createCollection : function (collectionName, options) {
    var deferred = Promise.defer(),
        options = options || {};

        db.createCollection(collectionName, options, function (err, collection) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(collection);
    });
    return deferred.promise;
},

    /**
     * Drop a collection from the database,removing it permanently.
     * New accesses will create a new collection.
     * @param collectionName (string) – the name of the collection we wish to drop.
     */
    dropCollection : function (collectionName) {
        var deferred = Promise.defer();

        db.dropCollection(collectionName, function (err, ret) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(ret);
        });
        return deferred.promise;
    },

    /**
     * Fetch all collections for the current db.
     * @returns {Promise}
     */
    collections : function collections() {
        var deferred = Promise.defer();

        db.collections(function (err, collections) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(collections);
        });
        return deferred.promise;
    },


    /**
     * Get the list of all collection names for the specified db
     * [collectionName] (string) – the collection name we wish to filter by.
     * [options] (object) – additional options during update.
     * @returns {Promise}
     */
    collectionNames : function (collectionName,options) {
        var deferred = Promise.defer(),
            options = options || {};

        db.collectionNames(collectionName, options, function (err, names) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(names);
        });
        return deferred.promise;
    },

    /**
     * inspect the collection whether exist.
     * @param [collectionName] (string) – the collection name we wish to detect.
     * @returns {Promise|*}
     */
    doesCollectionExist : function (collectionName) {
        return collections().then(function (collections) {
            var names = _.map(collections, function (collection) {
                return collection.collectionName;
            });
            return names.indexOf(collectionName) >= 0;
        });
    },

    /**
     * safe drop all of exist collections!
     * @returns {Promise|*}
     */
    safeDropCollections : function () {
        return collections().then(function (collections) {
            // filter out system collections, fill drop tasks
            /* var tasks = */
            _.map(_.filter(collections, function (collection) {
                return collection.collectionName.indexOf("system.") !== 0;
            }), function (collection) {
                return function () {
                    return dropCollection(collection.collectionName);
                };s
            });

            //return sequence(tasks);
        });
    },

    /**
     * Inserts a single document or a an array of documents into collection.
     * @param collectionName (string) – the collection name we wish to insert documents.
     * @param docs (array) – the content of documents
     * @param options (object) – optional options for insert command
     * @returns {Promise}
     */
    insertDocuments : function (collectionName, docs, options) {
        var collection = db.collection(collectionName),
            deferred = Promise.defer(),
            options = options || {};

        collection.insert(docs, options, function(err, result) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });
    },

    /**
     * Updates documents.
     * @param collectionName (string) – the collection name we wish to update documents.
     * @param selector (object) – the query to select the document/documents to be updated
     * @param document (object) – the fields/vals to be updated, or in the case of an upsert operation, inserted.
     * @param options (object) – additional options during update.
     * @returns {Promise}
     */
    updateDocuments : function (collectionName, selector, document, options) {
        var collection = db.collection(collectionName),
            deferred = Promise.defer(),
            options = options || {};

        collection.update(selector, document, options, function(err, result) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });
    },


    /**
     * Removes documents specified by selector from the db.
     * @param collectionName (string) – the collection name we wish to remove documents.
     * @param selector (object) – optional select, no selector is equivalent to removing all documents.
     * @param options (object) – additional options during remove.
     * @returns {Promise}
     */
    removeDocuments : function (collectionName, selector, options) {
        var collection = db.collection(collectionName),
            deferred = Promise.defer(),
            selector = selector || {},
            options = options || {};

        collection.remove(selector, options, function(err, result) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });
    },

    /**
     * Creates a cursor for a query that can be used to iterate over results from mongodb.
     * @param collectionName (string) – the collection name we wish to find documents.
     * @param query (object) – query object to locate the object to modify
     * @param options  (object) – additional options during update.
     */
    findDocuments : function (collectionName, query, options) {
        var collection = db.collection(collectionName),
            deferred = Promise.defer(),
            query = query || {},
            options = options || {};

        collection.find(query, options).toArray(function(err, result) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(result);
        });
    }
};


module.exports = {
    operations : operations
};