/**
 * Database operations only for mongodb.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/22.
 */



var config      = require('../../config'),

    Promise     = require('bluebird'),
    _           = require('lodash');


/**
 * ### Get collection
 * @param name (String)– the collection object we wish to get.
 * @returns {Promise}
 */
function collection (name) {
    return new Promise(function (resolve, reject) {
        config.database.db.collection(name, function (err, collection) {
            if (err) {
                return reject(err);
            }
            resolve(collection);
        });
    });
}

/**
 * ### Create collection
 * Create Collection with specified property
 * @param collectionName (string) – the collection name we wish to filter by.
 * @param [options] (object) – returns option results.
 * @returns {Promise}
 */
function createCollection (collectionName, options) {
    options = options || {};

    return new Promise(function (resolve, reject) {
        config.database.db.createCollection(collectionName, options, function (err, collection) {
            if (err) {
                return reject(err);
            }
            resolve(collection);
        });
    });
}

/**
 * ### Drop collection
 * Drop a collection from the database,removing it permanently.
 * New accesses will create a new collection.
 * @param collectionName (string) – the name of the collection we wish to drop.
 * @returns {Promise}
 */
function dropCollection (collectionName) {
    return new Promise(function (resolve, reject) {
        config.database.db.dropCollection(collectionName, function (err, ret) {
            if (err) {
                return reject(err);
            }
            resolve(ret);
        });
    });
}

/**
 * ### Fetch collection
 * Fetch all collections for the current config.database.db.
 * @returns {Promise}
 */
function collections () {
    return new Promise(function (resolve, reject) {
        config.database.db.collections(function (err, collections) {
            if (err) {
                return reject(err);
            }
            resolve(collections);
        });
    });
}

/**
 * ### Fetch collection
 * Get the list of all collection names expect system for the specified config.database.db
 * @returns {Promise}
 */
function collectionNames () {
    return collections().then(function (collections) {
        var arr_names = _.filter(_.map(collections, function (collection) {
            return collection.s.name;
        }), function (collectionName) {
            return collectionName.indexOf('system.') !== 0;
        });

        return arr_names;
    });
}

/**
 * ### Inspect collection
 * inspect the collection whether exist.
 * @param [collectionName] (string) – the collection name we wish to detect.
 * @returns {Promise|*}
 */
function doesCollectionExist (collectionName) {
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
function safeDropCollections () {
    return collectionNames().then(function (collectionNames) {
        var ops = _.map(collectionNames, function (collection) {
            return dropCollection(collection);
        });
        return Promise.all(ops);
    });
}

/**
 * ### Inserts a single document
 * Inserts a single document or a an array of documents into collection.
 * @param collectionName (string) – the collection name we wish to insert documents.
 * @param docs (Object) – the content of documents
 * @param [options] (object) – optional options for insert command
 * @returns {Promise}
 */
function insertDocuments (collectionName, docs, options) {
    var collection = config.database.db.collection(collectionName);
        options = options || {};

    return new Promise(function (resolve, reject) {
        collection.insert(docs, options, function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

/**
 * Updates documents.
 * @param collectionName (string) – the collection name we wish to update documents.
 * @param selector (object) – the query to select the document/documents to be updated
 * @param document (object) – the fields/vals to be updated, or in the case of an upsert operation, inserted.
 * @param [options] (object) – additional options during update.
 * @returns {Promise}
 */
function updateDocuments (collectionName, selector, document, options) {
    var collection = config.database.db.collection(collectionName);
        options = options || {};

    return new Promise(function (resolve, reject) {
        collection.update(selector, document, options, function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

/**
 * ### Removes Document
 * Removes documents specified by selector from the config.database.db.
 * @param collectionName (string) – the collection name we wish to remove documents.
 * @param [selector] (object) – optional select, no selector is equivalent to removing all documents.
 * @param [options] (object) – additional options during remove.
 * @returns {Promise}
 */
function removeDocuments (collectionName, selector, options) {
    var collection = config.database.db.collection(collectionName);
        selector = selector || {};
        options = options || {};

    return new Promise(function (resolve, reject) {
        collection.remove(selector, options, function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

/**
 * ### Find Document
 * Creates a cursor for a query that can be used to iterate over results from mongodb.
 * @param collectionName (string) – the collection name we wish to find documents.
 * @param [query] (object) – query object to locate the object to modify
 * @param [options]  (object) – additional options during update.
 * @returns {Promise}
 */
function findDocuments (collectionName, query, options) {
    var collection = config.database.db.collection(collectionName);
        query = query || {};
        options = options || {};

    return new Promise(function (resolve, reject) {
        collection.find(query, options).toArray(function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });

}

/**
 * ### Find One Document
 * Fetches the first document that matches the query.
 * @param collectionName (string) – the collection name we wish to find documents.
 * @param [query] (object) – query object to locate the object to modify
 * @param [options]  (object) – additional options during update.
 * @returns {Promise}
 */
function findOneDocument (collectionName, query, options) {
    var collection = config.database.db.collection(collectionName);
    query = query || {};
    options = options || {};

    return new Promise(function (resolve, reject) {
        collection.findOne(query, options, function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });

}

/**
 * ### Safe drop collections content
 * safe drop all of exist collections' content!
 * @returns {Promise|*}
 */
function safeDropCollectionsContent () {
    return collectionNames().then(function (collectionNames) {
        var ops = _.map(collectionNames, function (collection) {
            return removeDocuments(collection);
        });
        return Promise.all(ops);
    });
}

module.exports = {
    collection: collection,
    createCollection: createCollection,
    dropCollection: dropCollection,
    collections: collections,
    collectionNames: collectionNames,
    doesCollectionExist: doesCollectionExist,
    safeDropCollections: safeDropCollections,
    insertDocuments: insertDocuments,
    updateDocuments: updateDocuments,
    removeDocuments: removeDocuments,
    findDocuments: findDocuments,
    findOneDocument: findOneDocument,
    safeDropCollectionsContent : safeDropCollectionsContent
};