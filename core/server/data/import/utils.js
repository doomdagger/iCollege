/**
 * Import Module for iCollege
 * According to the given version of database, we will
 * select appropriate version of importer for our data
 * population.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */

var _           = require('lodash'),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    dataUtils = require('../utils'),

    internal    = {context: {internal: true}},
    utils,
    areEmpty,
    updatedSettingKeys,
    stripProperties;

updatedSettingKeys = {
    activePlugins: 'activeApps',
    installedPlugins: 'installedApps'
};

areEmpty = function (object) {
    var fields = _.toArray(arguments).slice(1),
        areEmpty = _.all(fields, function (field) {
            return _.isEmpty(object[field]);
        });

    return areEmpty;
};

stripProperties = function stripProperties(properties, data) {
    data = _.clone(data, true);
    _.each(data, function (obj) {
        _.each(properties, function (property) {
            delete obj[property];
        });
    });
    return data;
};

utils = {

    /**
     * ### import data into database
     * @param model (Model) Scheme Model
     * @param collectionName (String) collection name which imported data
     * @param transaction (Transaction) transaction object
     * @param jsonData (Object || String) import data
     * @param [strip]
     * @returns {*}
     */
    importData : function importData(model, collectionName, transaction, jsonData, strip) {

        //transform jsonData format
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }

        var ops = [];

        _.each(jsonData, function (data) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            //check if model exits _id document
            // We use findSingle function to find '_id' document as transaction doc backup.
            ops.push(dataUtils.findOneDocument(collectionName, {_id : mongoose.Types.ObjectId(data._id)}).then(function (result) {
                //if exits _id document,we should covert this document
                if (!_.isEmpty(result)) {
                    //set up the specific options for edit function
                    var options = {
                        _id : data._id,
                        context : internal.context
                    };

                    return model.edit(data, options).then(function () {
                        //if edit success, we should save find document result into transaction
                        transaction.backup(collectionName, result._id, result);
                    }).catch(function () {
                        transaction.flag = true;
                    });
                }
                else {

                    //else we should add this document into Model
                    var model_instance = model.forge(data);
                    model_instance._id = mongoose.Types.ObjectId(data._id);

                    return model_instance.__save(internal).then(function (savedResult) {
                        //if save function is success,we should save the _id member into transaction
                        transaction.backup(collectionName, savedResult.__id);
                    }).catch(function () {
                        transaction.flag = true;
                    });
                }

            })
            );
        });

        return Promise.all(ops);
    }
};

module.exports = utils;
