// # iCollege Shelf Object
// We don't have a common Shelf object like Ghost. Instead, we define one for ourselves.

var _          = require('lodash'),
    schema     = require('../data/schema'),
    mongoose   = require('mongoose');

// ## 关于model模块层级划分的文档介绍
// Shelf接受三个参数，分别为methods, statics, functions
// 对应的为: Model.prototype, Model, Schema.prototype
//
//
//

/**
 * My Shelf Class: 单例！！
 * @param methods [Object] Model instance level
 * @param statics [Object] Model Level
 * @param functions [Object] Schema Level
 * @constructor
 */
function Shelf(methods, statics, functions) {
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
    this.methods = {};
    // static methods to inherit
    this.statics = {};
    // functions to inherit
    this.functions = {};

    // add Model to our shelf
    this.Model = mongoose.Model;
    // add Schema to our shelf
    this.Schema = mongoose.Schema;

    // 杜绝覆盖mongoose的核心方法，所以使用了_.defaults，而非_.extend
    if (methods || statics || functions) {
        _.defaults(this.Model.prototype, methods);
        _.defaults(this.Model, statics);
        _.defaults(this.Schema.prototype, functions);
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
    var extended = new Shelf();
    // extend methods for default schema
    _.extend(extended.methods, this.methods, methods);
    // extend statics for default schema
    _.extend(extended.statics, this.statics, statics);
    // extend functions for default schema
    _.extend(extended.functions, this.functions, functions);

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
    _.extend(defaultSchema.methods, this.methods, methods);

    // extend statics for default schema
    _.extend(defaultSchema.statics, this.statics, statics);

    // extend schema functions
    _.extend(defaultSchema, this.functions, functions);

    // cache collection name
    defaultSchema.collectionName = collectionName;

    // register compulsory hooks
    if (!!defaultSchema.initialize)
        defaultSchema.initialize();
    else
        console.log("schema did not define initialize method");

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