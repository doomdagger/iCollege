// # Base token Object
// Basetoken其实就是一个Model instance，跟icollegeModel一样，都是instance。

var Promise         = require('bluebird'),
    icollegeModel   = require('./base'),
    errors          = require('../errors'),

    Basetoken;

Basetoken = icollegeModel.extend({
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Schema Level means Model Class can invoke


});

module.exports = Basetoken;
