/**
 * Import Module for iCollege.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */


var Promise         = require('bluebird'),
    _               = require('lodash'),
    validation      = require('../validation'),
    errors          = require('../../errors'),
    importer        = require('./data-importer'),
    validate,
    handleErrors,
    checkDuplicateAttributes,
    sanitize,
    cleanError;

cleanError = function cleanError(error) {
    var temp,
        message,
        offendingProperty,
        value;

    if (error.raw.message.toLowerCase().indexOf('unique') !== -1) {
        // This is a unique constraint failure
        if (error.raw.message.indexOf('ER_DUP_ENTRY') !== -1) {
            temp = error.raw.message.split('\'');
            if (temp.length === 5) {
                value = temp[1];
                temp = temp[3].split('_');
                offendingProperty = temp.length === 3 ? temp[0] + '.' + temp[1] : error.model;
            }
        } else if (error.raw.message.indexOf('SQLITE_CONSTRAINT') !== -1) {
            temp = error.raw.message.split('failed: ');
            offendingProperty = temp.length === 2 ? temp[1] : error.model;
            temp = offendingProperty.split('.');
            value = temp.length === 2 ? error.data[temp[1]] : 'unknown';
        } else if (error.raw.detail) {
            value = error.raw.detail;
            offendingProperty = error.model;
        }
        message = 'Duplicate entry found. Multiple values of "' + value + '" found for ' + offendingProperty + '.';
    }

    offendingProperty = offendingProperty || error.model;
    value = value || 'unknown';
    message = message || error.raw.message;

    return new errors.DataImportError(message, offendingProperty, value);
};

handleErrors = function handleErrors(errorList) {
    var processedErrors = [];

    if (!_.isArray(errorList)) {
        return Promise.reject(errorList);
    }

    _.each(errorList, function (error) {
        if (!error.raw) {
            // These are validation errors
            processedErrors.push(error);
        } else if (_.isArray(error.raw)) {
            processedErrors = processedErrors.concat(error.raw);
        } else {
            processedErrors.push(cleanError(error));
        }
    });

    return Promise.reject(processedErrors);
};

checkDuplicateAttributes = function checkDuplicateAttributes(data, comparedValue, attribs) {
    // Check if any objects in data have the same attribute values
    return _.find(data, function (datum) {
        return _.all(attribs, function (attrib) {
            return datum[attrib] === comparedValue[attrib];
        });
    });
};

sanitize = function sanitize() {
    // TODO do we have some sanitize logic for importing data?
};

validate = function validate(data) {
    var validateOps = [];

    _.each(_.keys(data.data), function (tableName) {
        _.each(data.data[tableName], function (importValues) {
            validateOps.push(validation.validateSchema(tableName, importValues));
        });
    });

    return Promise.settle(validateOps).then(function (descriptors) {
        var errorList = [];

        _.each(descriptors, function (d) {
            if (d.isRejected()) {
                errorList = errorList.concat(d.reason());
            }
        });

        if (!_.isEmpty(errorList)) {
            return Promise.reject(errorList);
        }
    });
};



module.exports.doImport = function (data) {

    //TODO : we don't need this function at this time
    //var sanitizeResults = sanitize(data);
    //data = sanitizeResults.data;

    //return validate(data).then(function () {
    //    return importer.importData(data);
    //})
    //    .then(function () {
    //    return sanitizeResults;
    //})
    //    .catch(function (result) {
    //    return handleErrors(result);
    //});

    return importer.importData(data).catch(function (result) {
        return handleErrors(result);
    });
};