var icollegeModel  = require('./base'),
    uuid           = require('node-uuid'),
    _              = require('lodash'),
    errors         = require('../errors'),
    Promise        = require('bluebird'),
    validation     = require('../data/validation'),
    internal       = {context: {internal: true}},

    Settings,
    defaultSettings;



// Each setting is saved as a separate row in the database,
// but the overlying API treats them as a single key:value mapping
Settings = icollegeModel.schema('settings', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Schema Level means Model Class can invoke


});


module.exports = {
    Settings: icollegeModel.model('Settings', Settings)
};
