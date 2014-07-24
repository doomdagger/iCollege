/**
 * Importer 000
 * Created by Li He on 2014/7/25.
 */

var when   = require('when'),
    _      = require('lodash'),
    models = require('../../models'),
    Importer000;


Importer000 = function () {
    _.bindAll(this, 'basicImport');

    this.version = '000';
};


module.exports = {
    Importer000: Importer000,
    importData: function (data) {
        // TODO: implement this function
        //return new Importer000().importData(data);
    }
};

