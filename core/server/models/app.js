/**
 * ## App Model
 * Created by Li He on 2014/7/23.
 */
var //when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    App,
    Apps;

// ## Schema definition
Apps = icollegeSchema.extend("apps", {
    // ### statics


}, {
    // ### methods


}, [
    // add plugins for Apps schema

]);




// Model definition
App = mongoose.model('App', Apps);


module.exports = {
    App: App,
    Apps: Apps
};
