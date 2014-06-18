var _              = require('lodash'),
    when           = require('when'),
    mongoose       = require('mongoose'),
    icollegeSchema = require('./base'),
    errors         = require('../errors'),
    schema     = require('../data/schema'),

    User,
    Users,
    collection = "users";


// Schema definition
Users = new mongoose.Schema(schema.collections[collection], _.merge({
    collection: collection
}, icollegeSchema.options));

// Model definition
User = mongoose.model('User', Users);


// Schema instance methods
var methods = {
    'findSameNames': function(cb) {
        // this refers to Model Object
        return this.model('User').find({ name: this.name }, cb);
    }
};

// Schema static methods
var statics = {
    'findByName': function(name, cb) {
        // this refers to Schema Object
        this.find({ name: new RegExp(name, 'i') }, cb);
    }
};

_.merge(statics, icollegeSchema.statics);
_.merge(Users.methods, methods);
_.merge(Users.statics, statics);


module.exports = {
    User: User,
    Users: Users
};





