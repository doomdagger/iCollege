/**
 * Database operation of transaction for mongodb.
 * Created by Xie Wei on 2014/3/1.
 */



var mongoose    = require('mongoose'),
    Promise     = require('bluebird'),
    _           = require('lodash'),
    //Model  = require('../../models').Transaction,

    db = mongoose.connection.db;


/**
 * Transaction Class
 * @constructor
 */
function Transaction () {

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
 * Save all of document into the array of transaction.
 * @param [collectionName] (string) – the collection name documents belong to.
 * @param [docs] (Array) - the documents we save into transaction.
 */
Transaction.prototype.backup = function (collectionName, docs) {

    _.each(docs, function (doc) {

        var transaction = {
            collectionName : collectionName,
            doc : doc
        };

        this.transArrary.push(transaction);
    });

};

/**
 * rollback datas to database.
 */
Transaction.prototype.rollback = function () {

    var deferred = Promise.defer();

    if (this.ops.length > 0) {
        //lock the rollback function,so only one rollback function working..
        //this.state = false;

        _.each(this.transArrary, function (transaction, index) {
            var collection = db.collection(transaction.collectionName);

            if (transaction.doc.length > 1) {
                //If doc have only one member,it must be "_id".
                //In this situation,the member of transaction is insert,so we just remove it.
                collection.remove(transaction.doc, function (err/*, result*/) {
                    if (err) {
                        //If it has problems while transaction,
                        //we should rollback again until documents recover.
                        //this.state = true;
                        deferred.reject();

                        //if the function is fail,we should delete the array member.
                        this.transArrary.splice(0, index + 1);
                        this.rollback();
                        return;
                    }
                });
            }
            else {
                collection.update({_id : transaction.doc._id}, transaction.doc, function (err/*, result*/) {
                    if (err) {
                        //the same reason.
                        //this.state = true;
                        deferred.reject();
                        this.transArrary.splice(0, index + 1);
                        this.rollback();
                        return;
                    }
                    //this.transArrary.splice(index, 1);
                });
            }

        });
    }

};

//Transaction.prototype.insert = function (collectionName, documents, options) {
//
//    var deferred = Promise.defer(),
//        collection = db.collection(collectionName),
//        options = options || {};
//
//    collection.insert(documents, options, function (err, result) {
//        if (err) {
//            //If it has problems while executing insert function,
//            //we should end up saving document into collection and recovery it.
//            deferred.reject();
//            this.rollback();
//            return;
//        }
//
//        //Save insert result's _id into transaction array.
//        _.each(result.ops, function (doc) {
//            //save each doc into transaction array member.
//            //not include doc member.
//            var transaction = {
//                doc_id: doc._id,
//                collection_name: collectionName
//            };
//
//            this.transArrary.push(transaction);
//        });
//    });
//
//    return this;
//}
//
//Transaction.prototype.remove = function (collectionName, selector, options) {
//
//    var deferred = Promise.defer(),
//        collection = db.collection(collectionName),
//        selector = selector || {},
//        options = options || {};
//
//    //find all of results from collection
//    collection.find(selector).toArray(function(err, docs) {
//        //Step 1 : Check if the find function is useful.
//        if (err) {
//            //If it has problems while executing find function,
//            //we should end up saving document into collection and recovery it.
//            deferred.reject();
//            this.rollback();
//            return;
//        }
//
//        //Step 2 : Documents record.
//        _.each(docs, function (doc) {
//
//            //save each doc into transaction array member.
//            //include doc member.
//            var transaction = {
//                doc_id: doc._id,
//                collection_name: collectionName,
//                doc: doc
//            };
//
//            this.transArrary.push(transaction);
//        });
//
//        //Step 3 : Remove collection.
//        collection.remove(selector, document, options, function (err, result) {
//            if (err) {
//                //If it has problems while executing update function,
//                //we should end up saving document into collection and recovery it.
//                deferred.reject();
//                this.rollback();
//                return;
//            }
//        });
//    });
//
//    return this;
//}
