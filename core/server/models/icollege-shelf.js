// # iCollege Shelf Object
// We don't have a common Shelf object like Ghost. Instead, we define one for ourselves.

var _          = require('lodash'),
    schema     = require('../data/schema'),
    mongoose   = require('mongoose'),
    errors     = require('../errors'),

    Shelf;

// ## 关于model模块层级划分的文档介绍
// Shelf接受三个参数，分别为methods, statics, functions
// 对应的为: Model.prototype, Model, Schema.prototype

/**
 * My Shelf Class: 单例！！
 * @param overwrite {Boolean} does this Shelf overwrite properties of Mongoose Components
 * @param methods {Object} Model instance level
 * @param statics {Object} Model Level
 * @param functions {Object} Schema Level
 * @constructor
 */
Shelf = function Shelf(overwrite, methods, statics, functions) {
    // # options for parent schema, descendants will override these options
    // pay attention to some specific part
    this.options = {
        autoIndex: true,
        id: true,
        toJSON: {
            getters: true,
            virtuals: false
        },
        toObject: {
            getters: true,
            virtuals: false
        }
    };

    // add Model to our shelf
    this.Model = mongoose.Model;
    // add Schema to our shelf
    this.Schema = mongoose.Schema;

    // 如果此Shelf将覆盖Mongoose，此Shelf不存储入参的任何变量
    // 所以变量均直接用于覆盖Mongoose
    if (overwrite) {
        this.methods = {};
        this.statics = {};
        this.functions = {};

        _.extend(this.Model.prototype, methods);
        _.extend(this.Model, statics);
        _.extend(this.Schema.prototype, functions);
    } else {
        // 如果此Shelf不覆盖Mongoose，此Shelf存储入参的所有变量
        this.methods = methods || {};
        this.statics = statics || {};
        this.functions = functions || {};
    }
};

/**
 * extend the base Shelf object to gain some inherited methods
 * @param {Object} methods - instance methods definition
 * @param {Object} statics - static methods definition
 * @param {Object} functions - functions definition
 * @returns {Shelf} return a brand new Shelf object
 */
Shelf.prototype.extend = function(methods, statics, functions) {
    var extended = new Shelf(false, methods, statics, functions);
    // 之所以用defaults，是因为主要以extended的自定义为主
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
 * @param {Object} [methods] - instance methods definition
 * @param {Object} [statics] - static methods definition
 * @param {Object} [functions] - functions for Schema level
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
    if (!!defaultSchema.initialize) {
        defaultSchema.initialize();
    }
    else {
        errors.logInfo(collectionName, "did not define initialize method");
    }

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

module.exports = Shelf;