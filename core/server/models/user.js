var _       = require('lodash'),
    when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),
    errors  = require('../errors'),

    User,
    Users;


// Schema definition
Users = icollegeSchema.extend("users", {
    // # statics
    'findByName': function (name, cb) {
        // this refers to Schema Object
        this.find({ name: new RegExp(name, 'i') }, cb);
    }
},{
    // # methods
    'findSameNames': function (cb) {
        // this refers to Model Object
        return this.model('User').find({ name: this.name }, cb);
    }
});



// Model definition
User = mongoose.model('User', Users);

module.exports = {
    User: User,
    Users: Users
};





