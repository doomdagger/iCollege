// # DB API
// API for DB operations
var dataExport       = require('../data/export'),
    when             = require('when'),
    errors           = require('../errors'),
    canThis          = require('../permissions').canThis,

    api              = {},
    db;

api.settings         = require('./settings');

/**
 * ## DB API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
db = {
    /**
     * ### Export Content
     * Generate the JSON to export
     *
     * @public
     * @returns {Promise} Ghost Export JSON format
     */
    'exportContent': function (options) {
        options = options || {};

        // Export data, otherwise send error 500
        return canThis(options.context).exportContent.db().then(function () {
            return dataExport().then(function (exportedData) {
                return when.resolve({ db: [exportedData] });
            }).otherwise(function (error) {
                return when.reject(new errors.InternalServerError(error.message || error));
            });
        }, function () {
            return when.reject(new errors.NoPermissionError('You do not have permission to export data. (no rights)'));
        });
    }
};

module.exports = db;
