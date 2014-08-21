/**
 * Export Module
 * Export database data into files for backup
 * Created by Li He on 2014/7/25.
 */

var _          = require('lodash'),
    when       = require('when'),
    callbacks  = require('when/callbacks'),

    versioning = require('../versioning'),
    config      = require('../../config'),
    utils      = require('../utils'),
    serverUtils = require('../../utils'),
    errors      = require('../../errors'),
    settings    = require('../../api/settings'),

    excludedTables = ['accesstokens', 'refreshtokens', 'clients'],
    exporter,
    exportFileName;

exportFileName = function () {
    var datetime = (new Date()).toJSON().substring(0, 10),
        title = '';

    // TODO: add read for setting api, test permission then
    return settings.read({key: 'title', context: {internal: true}}).then(function (result) {
        if (result) {
            title = serverUtils.safeString(result.settings[0].value) + '.';
        }
        return title + 'ghost.' + datetime + '.json';
    }).catch(function (err) {
        errors.logError(err);
        return 'ghost.' + datetime + '.json';
    });
};

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
module.exports.fileName = exportFileName;
