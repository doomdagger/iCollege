// # Users API
// RESTful API for the User resource
var when            = require('when'),
    dataProvider    = require('../models'),

    users;


/**
 * ## Posts API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
users = {

    /**
     * ## Browse
     * Fetch all users
     * @param {{context}} options (optional)
     * @returns {User} Users Collection
     */
    browse: function browse(options) {
        options = options || {};

        var name = options.name || '';

        //console.log('in users api:\n'+require('util').inspect(options)+'\n');

        return dataProvider.User.findByNamePromise(name).then(function (result) {
            return { users: result };
        }).catch(function (err) {
            return when.reject(err);
        });
    }


};

module.exports = users;
