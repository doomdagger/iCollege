/**
 * Export Module
 * Export database data into files for backup
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16.
 */

var _           = require('lodash'),
    Promise     = require('bluebird'),
    versioning  = require('../versioning'),
    utils       = require('../utils'),
    //serverUtils = require('../../utils'),
    errors      = require('../../errors'),
    settings    = require('../../api/settings'),

    excludedTables = ['accesstokens', 'refreshtokens', 'clients'],
    exporter,
    exportFileName;

exportFileName = function () {
    var datetime = (new Date()).toJSON().substring(0, 10),
        title = '';

    return 'icollege' + datetime + '.json';
};


exporter = function () {
    return Promise.join(versioning.getDatabaseVersion(), utils.collectionNames()).then(function (results) {
        var version = results[0],
            tables = results[1],
            selectOps = _.map(tables, function (name) {
                if (excludedTables.indexOf(name) < 0) {
                    return utils.findDocuments(name);
                }
            });

        return Promise.all(selectOps).then(function (tableData) {
            var exportData = {
                meta: {
                    exported_on: new Date().getTime(),
                    version: version
                },
                data: {
                    // Filled below
                }
            };

            _.each(tables, function (name, i) {
                exportData.data[tables[i]] = tableData[i];
            });

            return exportData;
        }).catch(function (err) {
            errors.logAndThrowError(err, 'Error exporting data', '');
        });
    });
};

module.exports = exporter;
module.exports.fileName = exportFileName;
