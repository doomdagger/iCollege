// # iCollege Model Object
// We don't have a common model object like Ghost. Instead, we define one for ourselves. 

var _          = require('lodash'),
    schema     = require('../data/schema'),
    mongoose   = require('mongoose');


/**
 * My Model Class
 * @constructor
 */
function Model(methods, statics) {
    // # options for parent schema, descendants will override these options
    // pay attention to some specific part
    this.options = {
        autoIndex: true,
        id: true,
        _id: false, // Note that currently you must disable the _id. After data is inserted, _id and id will be assigned
        toJSON: {
            getters: true,
            virtuals: false
        },
        toObject: {
            getters: true,
            virtuals: false
        }
    };

    // methods to inherit
    this.methods = methods || {};

    // static methods to inherit
    this.statics = statics || {};

    // give me some plugins
    this.plugins = [];
}

/**
 * extend the base Model object to gain some inherited methods
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @returns {Model} return a brand new Model object
 */
Model.prototype.extend = function(methods, statics) {
    var extended = new Model(methods, statics);
    // extend methods for default schema
    _.extend(extended.methods, this.methods);

    // extend statics for default schema
    _.extend(extended.statics, this.statics);

    extended.plugins = [].slice.apply(this.plugins);

    return extended;
};

/**
 * create schema object
 * @param {String} collectionName
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @returns {Mongoose.Schema} schema object
 */
Model.prototype.schema = function (collectionName, methods, statics) {

    var defaultSchema = new mongoose.Schema(
        // field and type and validations
        schema.collections[collectionName],
        // schema options
        _.extend({collection: collectionName}, this.options)
    );

    // extend methods for default schema
    _.extend(defaultSchema.methods, this.methods, methods || {});

    // extend statics for default schema
    _.extend(defaultSchema.statics, this.statics, statics || {});

    // apply plugin for the default schema
    _.forEach(this.plugins, function (plugin) {
        defaultSchema.plugin(plugin);
    });

    // cache collection name
    defaultSchema.collectionName = collectionName;

    return defaultSchema;
};

/**
 * create model object
 * @param modelName
 * @param schemaObject
 * @returns {*}
 */
Model.prototype.model = function (modelName, schemaObject) {
    return mongoose.model(modelName, schemaObject);
};


/**
 * register plugins for Model Object
 * @param plugin plugin function
 */
Model.prototype.plugin = function (plugin) {
    this.plugins.push(plugin);
};