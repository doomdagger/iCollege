// # User Model

var _              = require('lodash'),
    Promise        = require('bluebird'),
    errors         = require('../errors'),
    utils          = require('../utils'),
    bcrypt         = require('bcryptjs'),
    icollegeShelf = require('./base'),
    crypto         = require('crypto'),
    validator      = require('validator'),
    request        = require('request'),
    validation     = require('../data/validation'),
    config         = require('../config'),

    bcryptGenSalt  = Promise.promisify(bcrypt.genSalt),
    bcryptHash     = Promise.promisify(bcrypt.hash),
    bcryptCompare  = Promise.promisify(bcrypt.compare),

    tokenSecurity  = {},
    activeStates   = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'],
    invitedStates  = ['invited', 'invited-pending'],
    User,
    Users;

function validatePasswordLength(password) {
    return validator.isLength(password, 8);
}

function generatePasswordHash(password) {
    // Generate a new salt
    return bcryptGenSalt().then(function (salt) {
        // Hash the provided password with bcrypt
        return bcryptHash(password, salt);
    });
}

Users = icollegeShelf.schema('users', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


}, {
    // #### Schema instance level
    initialize: function () {
        icollegeShelf.Schema.prototype.initialize.apply(this, arguments);

        // TODO custom logic put here
    }
});

User = icollegeShelf.model('User', Users);


module.exports = {
    User: User,
    Users: Users
};
