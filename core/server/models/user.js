/**
 * # User Model
 */
var when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    User,
    Users;


// ## Schema definition
Users = icollegeSchema.extend("users", {
    // ### statics

    // findByName function, with the param name, find users
    'findByName': function (name, cb) {
        // this refers to Model instance
        this.find({ name: new RegExp(name, 'i') }, cb);
    },

    // findByNamePromise, the Promise/A+ version of findByName
    'findByNamePromise': function (name) {

        var found = when.defer();

        this.find({ name: new RegExp(name, 'i') }, function (err, users) {
            if (err) {
                found.reject(err);
                return;
            }

            found.resolve(users);
        });

        return found.promise;

    }

}, {
    // ### methods

    // findSameNames function
    'findSameNames': function (cb) {
        // this refers to Doc Instance,
        return this.model('User').find({ name: this.name }, cb);
    }

}, [
    // add plugins for Users schema
    //icollegeSchema.plugins.lastModifiedPlugin

]);




// Model definition
User = mongoose.model('User', Users);


module.exports = {
    User: User,
    Users: Users
};
