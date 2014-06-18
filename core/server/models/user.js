var _       = require('lodash'),
    when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),
    errors  = require('../errors'),
    schema  = require('../data/schema'),

    User,
    Users,
    collection = "users";


// Schema instance methods
var methods = {
    'findSameNames': function (cb) {
        // this refers to Model Object
        return this.model('User').find({ name: this.name }, cb);
    }
};

// Schema static methods
var statics = {
    'findByName': function (name, cb) {
        // this refers to Schema Object
        this.find({ name: new RegExp(name, 'i') }, cb);
    }
};


// Schema definition
Users = new mongoose.Schema(
    // field and type and validations
    schema.collections[collection],
    // schema options
    _.extend({}, icollegeSchema.options,
        {
            collection: collection
        }
    )
);

// Model definition
User = mongoose.model('User', Users);


_.extend(Users.statics, icollegeSchema.statics, statics);
_.extend(Users.methods, methods);

_.mapValues(icollegeSchema.plugins, function(plugin){
    Users.plugin(plugin);
});


module.exports = {
    User: User,
    Users: Users
};





