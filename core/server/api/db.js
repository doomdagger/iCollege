// # DB API
// API for DB operations
var dataExport       = require('../data/export'),
    when             = require('when'),
    errors           = require('../errors'),
    db;


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
    'exportContent': function () {

        // Export data, otherwise send error 500
        return dataExport().then(function (exportedData) {
            return when.resolve({ db: [exportedData] });
        }).otherwise(function (error) {
            return when.reject(new errors.InternalServerError(error.message || error));
        });
    }
};

module.exports = db;
