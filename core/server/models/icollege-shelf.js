// # iCollege Shelf Object
// We don't have a common Shelf object like Ghost. Instead, we define one for ourselves.

var _          = require('lodash'),
    schema     = require('../data/schema'),
    mongoose   = require('mongoose');


/**
 * My Shelf Class
 * @param base {Boolean} is this shelf the base one
 * @param methods {Object} Model instance level
 * @param statics {Object} Model Level
 * @param functions {Object} Schema Level
 * @constructor
 */
function Shelf(base, methods, statics, functions) {
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

    // is this the base Shelf
    // we could only have one base shelf
    this.base = base;

    // methods to inherit
    this.methods = methods || {};

    // static methods to inherit
    this.statics = statics || {};

    // functions to inherit
    this.functions = functions || {};

    // add Model to our shelf
    this.Model = mongoose.Model;

    // add Schema to our shelf
    this.Schema = mongoose.Schema;

    // 如果是base，那把functions注册到mongoose的Schema prototype下
    // 杜绝覆盖mongoose的核心方法，所以使用了_.defaults，而非_.extend
    if (this.base) {
        _.defaults(this.Schema.prototype, this.functions);
        _.defaults(this.Model, this.statics);
    }
}

/**
 * extend the base Shelf object to gain some inherited methods
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @param {Object} functions - functions definition
 * @returns {Shelf} return a brand new Shelf object
 */
Shelf.prototype.extend = function(methods, statics, functions) {
    var extended = new Shelf(false, methods, statics, functions);
    // extend methods for default schema
    _.defaults(extended.methods, this.methods);

    // extend statics for default schema
    _.defaults(extended.statics, this.statics);

    // extend functions for default schema
    _.defaults(extended.functions, this.functions);

    return extended;
};

/**
 * create schema object
 * @param {String} collectionName
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @param {Object} functions - functions for Schema level
 * @returns {Mongoose.Schema} schema object
 */
Shelf.prototype.schema = function (collectionName, methods, statics, functions) {

    var defaultSchema = new mongoose.Schema(
        // field and type and validations
        schema.collections[collectionName],
        // schema options
        _.defaults({collection: collectionName}, this.options)
    );

    // extend methods for default schema
    _.extend(defaultSchema.methods, this.methods, methods || {});

    // extend statics for default schema
    _.extend(defaultSchema.statics, this.statics, statics || {});

    // extend schema functions
    _.extend(defaultSchema, this.functions, functions || {});

    // cache collection name
    defaultSchema.collectionName = collectionName;

    // register compulsory hooks
    defaultSchema.initialize();

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