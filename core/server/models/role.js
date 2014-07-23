/**
 * ## Role Model
 * Created by Li He on 2014/7/23.
 */
var //when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Role,
    Roles;

// ## Schema definition
Roles = icollegeSchema.extend("roles", {
    // ### statics


}, {
    // ### methods


}, [
    // add plugins for Roles schema    

]);




// Model definition
Role = mongoose.model('Role', Roles);


module.exports = {
    Role: Role,
    Roles: Roles
};
