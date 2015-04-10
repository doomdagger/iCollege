/**
 * Database operations only for mongodb.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/22.
 */



var config      = require('../../config'),

    Promise     = require('bluebird'),
    _           = require('lodash');
    
/**
 * ### Create collection
 * Create Collection with specified property
 * @param [collectionName] (string) – the collection name we wish to filter by.
 * @param [options] (object) – returns option results.
 */
function createCollection(collectionName, options) {
    var deferred = Promise.defer();
        options = options || {};

    config.database.db.createCollection(collectionName, options, function (err, collection) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(collection);
    });
    return deferred.promise;
}

/**
 * ### Drop collection
 * Drop a collection from the database,removing it permanently.
 * New accesses will create a new collection.
 * @param collectionName (string) – the name of the collection we wish to drop.
 */
function dropCollection(collectionName) {
    var deferred = Promise.defer();

    config.database.db.dropCollection(collectionName, function (err, ret) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(ret);
    });
    return deferred.promise;
}

/**
 * ### Fetch collection
 * Fetch all collections for the current config.database.db.
 * @returns {Promise}
 */
function collections() {
    var deferred = Promise.defer();

    config.database.db.collections(function (err, collections) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(collections);
    });
    return deferred.promise;
}

/**
 * ### Fetch collection
 * Get the list of all collection names for the specified config.database.db
 * [collectionName] (string) – the collection name we wish to filter by.
 * [options] (object) – additional options during update.
 * @returns {Promise}
 */
function collectionNames(collectionName,options) {
    var deferred = Promise.defer();
        options = options || {};

    config.database.db.collectionNames(collectionName, options, function (err, names) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(names);
    });
    return deferred.promise;
}

/**
 * ### Inspect collection
 * inspect the collection whether exist.
 * @param [collectionName] (string) – the collection name we wish to detect.
 * @returns {Promise|*}
 */
function doesCollectionExist(collectionName) {
    return collections().then(function (collections) {
        var names = _.map(collections, function (collection) {
            return collection.collectionName;
        });
        return names.indexOf(collectionName) >= 0;
    });
}

/**
 * ### Safe drop collections
 * safe drop all of exist collections!
 * @returns {Promise|*}
 */
function safeDropCollections() {
    return collections().then(function (collections) {
        // filter out system collections, fill drop tasks
        /* var tasks = */
        _.map(_.filter(collections, function (collection) {
            return collection.collectionName.indexOf("system.") !== 0;
        }), function (collection) {
            return function () {
                return dropCollection(collection.collectionName);
            };
        });

        //return sequence(tasks);
    });
}


/**
 * ### Inserts a single document
 * Inserts a single document or a an array of documents into collection.
 * @param collectionName (string) – the collection name we wish to insert documents.
 * @param docs (array) – the content of documents
 * @param options (object) – optional options for insert command
 * @returns {Promise}
 */
function insertDocuments(collectionName, docs, options) {
    var collection = config.database.db.collection(collectionName),
        deferred = Promise.defer();
        options = options || {};

    collection.insert(docs, options, function(err, result) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(result);
    });
}

/**
 * Updates documents.
 * @param collectionName (string) – the collection name we wish to update documents.
 * @param selector (object) – the query to select the document/documents to be updated
 * @param document (object) – the fields/vals to be updated, or in the case of an upsert operation, inserted.
 * @param options (object) – additional options during update.
 * @returns {Promise}
 */
function updateDocuments(collectionName, selector, document, options) {
    var collection = config.database.db.collection(collectionName),
        deferred = Promise.defer();
        options = options || {};

    collection.update(selector, document, options, function(err, result) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(result);
        return result;
    });
}

/**
 * ### Removes Document
 * Removes documents specified by selector from the config.database.db.
 * @param collectionName (string) – the collection name we wish to remove documents.
 * @param selector (object) – optional select, no selector is equivalent to removing all documents.
 * @param options (object) – additional options during remove.
 * @returns {Promise}
 */
function removeDocuments(collectionName, selector, options) {
    var collection = config.database.db.collection(collectionName),
        deferred = Promise.defer();
        selector = selector || {};
        options = options || {};

    collection.remove(selector, options, function(err, result) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(result);
    });
}

/**
 * ### Find Document
 * Creates a cursor for a query that can be used to iterate over results from mongodb.
 * @param collectionName (string) – the collection name we wish to find documents.
 * @param query (object) – query object to locate the object to modify
 * @param options  (object) – additional options during update.
 */
function findDocuments(collectionName, query, options) {
    var collection = config.database.db.collection(collectionName),
        deferred = Promise.defer();
        query = query || {};
        options = options || {};

    collection.find(query, options).toArray(function(err, result) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(result);
        return result;
    });
}


module.exports = {
    createCollection: createCollection,
    dropCollection: dropCollection,
    collections: collections,
    collectionNames: collectionNames,
    doesCollectionExist: doesCollectionExist,
    safeDropCollections: safeDropCollections,
    insertDocuments: insertDocuments,
    updateDocuments: updateDocuments,
    removeDocuments: removeDocuments,
    findDocuments: findDocuments
};