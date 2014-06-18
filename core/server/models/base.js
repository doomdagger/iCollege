// # Base

var mongoose   = require('mongoose'),
    when       = require('when'),
    _          = require('lodash'),

    config     = require('../config'),
    errors     = require('../errors'),

    icollegeSchema = {};

// plugins for icollege schema
icollegeSchema.plugins = {
    'lastModifiedPlugin': function (schema, options) {
        schema.add({ lastMod: Date });

        schema.pre('save', function (next) {
            this.lastMod = new Date;
            next();
        });

        if (options && options.index) {
            schema.path('lastMod').index(options.index)
        }
    }
};


// static method for icollege schema
icollegeSchema.statics = {

};

// options for schema
icollegeSchema.options = {
    id: true,
    _id: true,
    autoIndex: true,
    toJSON: {
        getters: false,
        virtuals: false
    },
    toObject: {
        getters: false,
        virtuals: false
    }
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


module.exports = icollegeSchema;
module.exports.init = init;