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
function ICollegeSchema(options, statics){
    // # options for parent schema, descendants will override these options
    // pay attention to some specific part
    this.options = options;
    // static methods to inherit
    this.statics = statics;

}

ICollegeSchema.prototype.extend = function(collectionName, statics, methods){

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

    // plugin configurations goes here
    defaultSchema.add({ lastMod: Date });

    defaultSchema.pre('save', function (next) {
        this.lastMod = new Date;
        next();
    });

    return defaultSchema;
};



/**
 * connect to mongodb
 * @returns {Object} connection object
 */
function init() {
    var connectionInfo = config().database.mongodb.connection,
        connected = when.defer();

    mongoose.connect(connectionInfo.host,
        connectionInfo.database,
        connectionInfo.port,
        config().database.mongodb.options);

    mongoose.connection.once('open', function(){
        connected.resolve();
    });

    mongoose.connection.on('error', function(){
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
},{
    // static methods definition goes here

});


module.exports = icollegeSchema;
module.exports.init = init;