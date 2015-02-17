// # iCollege Shelf Object
// We don't have a common Shelf object like Ghost. Instead, we define one for ourselves.

var _          = require('lodash'),
    schema     = require('../data/schema'),
    mongoose   = require('mongoose');


/**
 * My Shelf Class
 * @constructor
 */
function Shelf(methods, statics) {
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

    // add Model to our shelf
    this.Model = mongoose.Model;
}

/**
 * extend the base Shelf object to gain some inherited methods
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @returns {Shelf} return a brand new Shelf object
 */
Shelf.prototype.extend = function(methods, statics) {
    var extended = new Shelf(methods, statics);
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
Shelf.prototype.schema = function (collectionName, methods, statics) {

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
Shelf.prototype.model = function (modelName, schemaObject) {
    return mongoose.model(modelName, schemaObject);
};


/**
 * register plugins for Shelf Object
 * @param plugin plugin function
 */
Shelf.prototype.plugin = function (plugin) {
    this.plugins.push(plugin);
};