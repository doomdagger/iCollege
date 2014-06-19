
var base = require('../server/storage/base'),
    _   = require('lodash'),
    mongoose = require('mongoose'),
    util    = require('util');

var defaultSchema = new mongoose.Schema({
    name: String,
    age: Number
});

var Default = mongoose.model('Default', defaultSchema);

console.log(util.inspect(defaultSchema.paths));