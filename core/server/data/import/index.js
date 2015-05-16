/**
 * Import Module for iCollege.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */


var Promise         = require('bluebird'),
    errors          = require('../../errors'),
    importer        = require('./data-importer'),
    versioning  = require('../versioning');

/**
 * check data file version is current database version
 * @param data (Object) data file
 * @returns {*}
 */
function checkDataFileVersion(data) {
    var file_version = data.meta.version;

    return versioning.getDatabaseVersion().then(function (version) {

        if (file_version === version) {
            return version;
        }

        throw new errors.DataImportError("Invalid Data File version.", 'version', file_version);
    });
}

module.exports.doImport = function (data) {

    // Step 1 : check data file version
    return checkDataFileVersion(data).then(function () {
        // Step 2 : import data
        return importer.importData(data);

    }).catch(function (error) {
        return Promise.resolve(error);
    });

};