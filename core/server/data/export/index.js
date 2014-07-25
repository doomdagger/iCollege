/**
 * Export Module
 * Export database data into files for backup
 * Created by Li He on 2014/7/25.
 */

var _          = require('lodash'),
    when       = require('when'),
    versioning = require('../versioning'),
    utils      = require('../utils'),

    callbacks  = require('when/callbacks'),
    excludedTables = [], // empty till now
    exporter;

exporter = function () {

    return when.join(versioning.getDatabaseVersion(), utils.collections()).then(function (results) {
        var version = results[0],
            collections = results[1],
            selectOps = _.map(collections, function (collection) {
                if (excludedTables.indexOf(collection.collectionName) < 0) {
                    return callbacks.call(collection.find({}).toArray);
                }
            });

        return when.all(selectOps).then(function (collectionData) {
            var exportData = {
                meta: {
                    exported_on: new Date().getTime(),
                    version: version
                },
                data: {
                    // Filled below
                }
            };

            _.each(collections, function (collection, i) {
                exportData.data[collection.collectionName] = collectionData[i];
            });


            return when.resolve(exportData);
        }).catch(function (err) {
            console.log('Error exporting data: ' + err);
        });
    });
};

module.exports = exporter;
