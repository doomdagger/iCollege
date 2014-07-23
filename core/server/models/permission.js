/**
 * ## Permission Model
 * Created by Li He on 2014/7/23.
 */
var //when = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Permission,
    Permissions;

// ## Schema definition
Permissions = icollegeSchema.extend("permissions", {
    // ### statics


}, {
    // ### methods


}, [
    // add plugins for Permissions schema

]);


// Model definition
Permission = mongoose.model('Permission', Permissions);


module.exports = {
    Permission: Permission,
    Permissions: Permissions
};
