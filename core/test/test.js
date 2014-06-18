
var base = require('../server/storage/base'),
    _   = require('lodash');

console.log(base.getTargetDir('hello'));

var a = {
    name: 'lihe',
    age : 9
};

var b = {
    name: 'haha',
    sex: 'm'
};


console.log(_.merge(a, b));

console.log(a);

