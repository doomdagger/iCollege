/**
 * Import Module for iCollege
 * According to the given version of database, we will
 * select appropriate version of importer for our data
 * population.
 * Created by Li He on 2014/7/25.
 */


var when = require('when');

module.exports = function (version, data) {
    var importer;

    try {
        importer = require('./' + version);
    } catch (ignore) {
        // Zero effs given
    }

    if (!importer) {
        return when.reject("No importer found");
    }

    return importer.importData(data);
};
