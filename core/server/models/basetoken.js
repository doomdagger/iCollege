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

        return this.removeAsync({expires: {$lt: Date.now()}}).then(function (res) {
            return res.result;
        });
    },


    /**
     * ### destroyByUser
     * @param  {[type]} options has context and id. Context is the user doing the destroy, id is the user to destroy
     */
    destroyByUser: function (options) {
        var userId = options.id || options._id;

        if (userId) {
            return this.removeAsync({user_id: userId}).then(function (res) {
                return res.result;
            });
        }

        return Promise.reject(new errors.NotFoundError('No user found'));
    },


    /**
     * ### destroyByToken
     * @param  {[type]} options has token where token is the token to destroy
     */
    destroyByToken: function (options) {
        var token = options.token;

        if (token) {
            return this.removeAsync({token: token}).then(function (res) {
                return res.result;
            });
        }

        return Promise.reject(new errors.NotFoundError('Token not found'));
    }

}, {
    // override for base function since we don't have
    // a updated_by field for sessions
    saving: function (next, options) {
        /*jshint unused:false*/
        next(options);
    },

    // override for base function since we don't have
    // a updated_by field for sessions
    updating: function (next) {
        next();
    }

});

module.exports = basetokenShelf;
