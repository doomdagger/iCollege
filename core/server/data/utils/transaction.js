/**
 * Database operation of transaction for mongodb.
 * Created by Xie Wei on 2014/3/1.
 */



var Promise     = require('bluebird'),
    _           = require('lodash'),

    config      = require('../../config'),
    utils       = require('./index');

    Transaction;


/**
 * Transaction Class
 * @constructor
 */
Transaction = function Transaction () {

    //It is the array of transaction for saving all of database operations.
    //The type of array's member is ObjectId.
    this.transArrary = [];

    //flag is the symbol that whether rollback
    this.flag = false;
};


/**
 * ### Backup data
 * Save all of document into the array of transaction.
 * if use after save success, you should use by it : 'backup(collectionName, _id)'
 * other you should save the document for update : 'backup(collectionName, _id, doc)'
 * @param collectionName (String) – the collection name documents belong to.
 * @param _id (Object) - the id of document that we save.
 * @param [doc] (Array) - the document we change before update..
 */
Transaction.prototype.backup = function (collectionName, _id, doc) {
    var transaction;
    doc = doc || {};
    transaction = {
        collectionName : collectionName,
        _id : _id,
        doc : doc
    };
    this.transArrary.push(transaction);
};

/**
 * ### rollback data to database.
 */
Transaction.prototype.rollback = function () {
    var self = this,
        promises = [];

    if (self.flag === true) {
        // if the value of flag is equal with true, we should rollback all of documents that save in transaction array
        // Step 1 : reset flag
        self.flag = false;

        // Step 2 : rollback all of documents one by one
        promises = _.map(self.transArrary, function (transaction) {
            var collection = config.database.db.collection(transaction.collectionName);

            if (_.isEmpty(transaction.doc)) {

                // If doc have only one member,it must be "_id".
                // In this situation,the member of transaction is insert,so we just remove it.

                return utils.removeDocuments(collection, transraction.doc).then(function () {

                    // if removing the document is success,
                    // remove the document from transaction array
                    _.filter(self.transArrary, function () {
                        return self.transArrary.collectionName !== transraction.collectionName &&
                            self.transArrary._id !== transraction._id;
                    });

                }, function () {
                    // if removing is fail, change flag state
                    self.flag = true;
                });
            }
            else {
                utils.updateDocuments(collection, {_id : transaction._id}, transaction.doc).then(function () {

                    // if updating the document is success,
                    // remove the document from transaction array

                    _.filter(self.transArrary, function () {
                        return self.transArrary.collectionName !== transraction.collectionName &&
                            self.transArrary._id !== transraction._id;
                    });

                }, function () {
                    // if updating is fail, change flag state
                    self.flag = true;
                });
            }

        });
    }

    return Promise.all(promises).catch(function () {
        self.rollback();
    });
};

module.exports = Transaction;