/**
 * Database operation of transaction for mongodb.
 * Created by Xie Wei on 2014/3/1.
 */



var Promise     = require('bluebird'),
    _           = require('lodash'),

    config      = require('../../config');


/**
 * Transaction Class
 * @constructor
 */
Transaction = function Transaction () {

    //It is the array of transaction for saving all of database operations.
    //The type of array's member is ObjectId.
    this.transArrary = [];

    //ops save Promise.reject solution
    this.ops = [];

    //transaction state
    //when the transaction initialize,the value of state is true meaning the transaction is not working.
    //this.state = true;
}


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

    var doc = doc || {},
        transaction = {
            collectionName : collectionName,
            _id : _id,
            doc : doc
        };

    this.transArrary.push(transaction);
};

/**
 * rollback data to database.
 */
Transaction.prototype.rollback = function () {
    var self = this;
    return new Promise(function (reslove, reject) {
        if (self.ops.length > 0) {
            //lock the rollback function,so only one rollback function working..
            //this.state = false;

            _.each(self.transArrary, function (transaction, index) {
                var collection = config.database.db.collection(transaction.collectionName);

                if (_.isEmpty(transaction.doc)) {
                    //If doc have only one member,it must be "_id".
                    //In this situation,the member of transaction is insert,so we just remove it.
                    collection.remove(transaction.doc, function (err/*, result*/) {
                        if (err) {
                            //If it has problems while transaction,
                            //we should rollback again until documents recover.
                            //this.state = true;
                            reject(err);

                            //if the function is fail,we should delete the array member.
                            self.transArrary.splice(0, index + 1);
                            self.rollback();
                            return;
                        }
                    });
                }
                else {
                    collection.update({_id : transaction._id}, transaction.doc, function (err/*, result*/) {
                        if (err) {
                            //the same reason.
                            //this.state = true;
                            reject(err);
                            self.transArrary.splice(0, index + 1);
                            self.rollback();
                            return;
                        }
                    });
                }

            });
        }
    });
};

module.exports = Transaction;