// # Base Model
// This is the model from which all other iCollege models extend. The model provides
// several basic behaviours such as UUIDs, as well as a set of Data methods for accessing information from the database.
//
// The models are internal to iCollege, only the API and some internal functions such as migration and import/export
// accesses the models directly. All other parts of iCollege are only
// allowed to access data via the API.

var _          = require('lodash'),
    mongoose   = require('mongoose'),
    config     = require('../config'),
    errors     = require('../errors'),
    moment     = require('moment'),
    Promise    = require('bluebird'),
    sanitize   = require('validator').sanitize,
    schema     = require('../data/schema'),
    utils      = require('../utils'),
    uuid       = require('node-uuid'),
    validation = require('../data/validation'),
    Model      = require('./icollege-model'),

    icollegeModel;


// ### icollegeModel
// Initializes a new Model instance called icollegeModel, for reference elsewhere in iCollege.
icollegeModel = new Model({
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke



}, {
    // #### Model Level methods, Statics
    // Methods on Schema Level means Model Class can invoke

    // Get permitted attributes from server/data/schema.js, which is where the DB schema is defined
    permittedAttributes: function () {
        return _.keys(schema.collections[this.schema.collectionName]);
    },

    // Return default model instance
    defaults: function () {
        return {
            uuid: uuid.v4()
        };
    }





});

// ### Register Plugins here, demo
icollegeModel.plugin(function (schema, options) {


});


module.exports = icollegeModel;
