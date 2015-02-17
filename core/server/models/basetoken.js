// # Base token Object
// Basetoken其实就是一个Shelf instance，跟icollegeShelf一样，都是instance。

var Promise         = require('bluebird'),
    icollegeShelf   = require('./base'),
    errors          = require('../errors'),

    basetokenShelf;

basetokenShelf = icollegeShelf.extend({
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Schema Level means Model Class can invoke


});

module.exports = basetokenShelf;
