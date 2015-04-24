// # Base token Object
// Basetoken其实就是一个Shelf instance，跟icollegeShelf一样，都是instance。

var Promise         = require('bluebird'),
    icollegeShelf   = require('./base'),
    errors          = require('../errors'),

    basetokenShelf;

basetokenShelf = icollegeShelf.extend({
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke
    destroyAllExpired:  function () {
        return this.removeAsync({expires: {$lt: Date.now()}});
    },


    /**
     * ### destroyByUser
     * @param  {[String]} userId userId is the user to destroy
     */
    destroyByUser: function (userId) {
        if (userId) {
            return this.removeAsync({user_id: userId});
        }

        return Promise.reject(new errors.NotFoundError('No user found'));
    },


    /**
     * ### destroyByToken
     * @param  {[String]} options has token where token is the token to destroy
     */
    destroyByToken: function (token) {
        if (token) {
            return this.removeAsync({token: token});
        }

        return Promise.reject(new errors.NotFoundError('Token not found'));
    }

}, {
    // override for base function since we don't have
    // a updated_by field for sessions
    saving: function (next) {
        next();
    },

    // override for base function since we don't have
    // a updated_by field for sessions
    updating: function (next, criteria, doc, options) {
        options = this.filterOptions(options, "update");
        next(criteria, doc, options);
    }

});

module.exports = basetokenShelf;
