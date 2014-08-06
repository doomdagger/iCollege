// # Base

var mongoose   = require('mongoose'),
    when       = require('when'),
    _          = require('lodash'),

    config     = require('../config'),
    errors     = require('../errors'),
    schema  = require('../data/schema'),

    icollegeSchema;

/**
 * My Schema Class
 * @param {Object} options
 * @param {Object} statics
 * @constructor
 */
function ICollegeSchema(options, statics) {
    // # options for parent schema, descendants will override these options
    // pay attention to some specific part
    this.options = options;
    // static methods to inherit
    this.statics = statics;

}

/**
 * extend the base ICollegeSchema object to gain some inherited methods
 * @param {String} collectionName
 * @param {Object} statics - static methods definition
 * @param {Object} methods - instance methods definition
 * @param {Array} plugins - plugin array you want to apply to the schema
 * @returns {exports.Schema} schema object
 */
ICollegeSchema.prototype.extend = function (collectionName, statics, methods, plugins) {

    var defaultSchema = new mongoose.Schema(
        // field and type and validations
        schema.collections[collectionName],
        // schema options
        _.extend({ collection: collectionName }, this.options)
    );

    // extend statics for default schema
    _.extend(defaultSchema.statics, this.statics, statics);
    // extend methods for default schema
    _.extend(defaultSchema.methods, methods);
    // apply plugin for the default schema
    _.forEach(plugins, function (plugin) {
        defaultSchema.plugin(plugin);
    });

    return defaultSchema;
};



/**
 * connect to mongodb
 * @returns {Object} connection object
 */
function init() {
    var connectionInfo = config().database.mongodb.connection,
        connected = when.defer(),
        options = config().database.mongodb.options || {};


    mongoose.connect(connectionInfo.host,
        connectionInfo.database,
        connectionInfo.port,
        options);

    mongoose.connection.once('open', function () {
        connected.resolve();
    });

    mongoose.connection.on('error', function () {
        errors.logAndThrowError(new Error('cannot connect to mongodb...'), __dirname, 'Please check your mongodb configuration and config.js');

        connected.reject();
    });


    return connected.promise;
}


// global base Schema Object
icollegeSchema = new ICollegeSchema({

    id  : true,
    _id : true,
    autoIndex: true,
    toJSON: {
        getters: false,
        virtuals: false
    },
    toObject: {
        getters: false,
        virtuals: false
    }
}, {
    // static methods definition goes here

    /**
     * Find all documents in a collection
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @return {Promise} when.promise
     */
    'findAllPromised': function (fields, options) {
        return this.findPromised({}, fields, options);
    },

    /**
     * Find one using Promise/A+
     * @param {Object} conditions
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @return {Promise} when.promise
     */
    'findOnePromised': function (conditions, fields, options) {
        var deferred = when.defer();
        this.findOne(conditions, fields, options, function (err, found) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(found);
        });

        return deferred.promise;
    },

    /**
     * Find Multi using Promise/A+
     * @param {Object} conditions
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @return {Promise} when.promise
     */
    'findPromised': function (conditions, fields, options) {
        var deferred = when.defer();
        this.find(conditions, fields, options, function (err, founds) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(founds);
        });

        return deferred.promise;
    },

    /**
     * Find Multi By Selecting some fields using Promise/A+
     * @param {Object} conditions
     * @param {String|Object} path populated path
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @returns {*}
     */
    'findAndPopulatePromised': function (conditions, path, fields, options) {
        var deferred = when.defer();
        this.find(conditions, fields, options).populate(path).exec(function (err, found) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(found);
        });

        return deferred.promise;
    },

    /**
     * Find One By Selecting some fields using Promise/A+
     * @param {Object} conditions
     * @param {String|Object} path populated path
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @returns {*}
     */
    'findOneAndPopulatePromised': function (conditions, path, fields, options) {
        var deferred = when.defer();
        this.find(conditions, fields, options).populate(path).exec(function (err, found) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(found);
        });

        return deferred.promise;
    },

    /**
     * Find one by id using Promise/A+
     * @param {ObjectId} id
     * @param {Object} [fields] optional fields to select
     * @param {Object} [options] optional
     * @return {Promise} when.promise found model
     */
    'findByIdPromised': function (id, fields, options) {
        var deferred = when.defer();
        this.findById(id, fields, options, function (err, found) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(found);
        });

        return deferred.promise;
    },

    /**
     * update Multi using Promise/A+
     * @param {Object} conditions
     * @param {Object} [update] optional fields to update with the given operator
     * @param {Object} [options] optional
     * @return {Promise} when.promise number of documents affected
     */
    'updatePromised': function (conditions, update, options) {
        var deferred = when.defer();
        this.update(conditions, update, options, function (err, numberAffected) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(numberAffected);
        });
        return deferred.promise;
    },

    /**
     * update Multi using Promise/A+
     * @param {Object} conditions
     * @return {Promise} when.promise number of documents affected
     */
    'removePromised': function (conditions) {
        var deferred = when.defer();
        this.remove(conditions, function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve();
        });
        return deferred.promise;
    },

    /**
     * Aggregate query
     * @param {Array} array containing all the aggregation framework commands for the execution.
     * @param {Object} [options] additional options during update.
     * @returns {*}
     */
    'aggregatePromised': function (array, options) {
        var deferred = when.defer();
        this.aggregate(array, options, function (err, res) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(res);
        });
        return deferred.promise;
    },

    /**
     * Count entry size with the given conditions
     * @param {Object} conditions
     * @returns {Promise} when.Promise with Number
     */
    'countPromised': function (conditions) {
        var deferred = when.defer();
        this.count(conditions, function (err, count) {
            if (err) {
                deferred.reject(err);
                return;
            }
            deferred.resolve(count);
        });
        return deferred.promise;
    }

});


module.exports = icollegeSchema;
module.exports.init = init;
module.exports.plugins = require('./plugins');