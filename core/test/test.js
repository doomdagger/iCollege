
var base = require('../server/storage/base'),
    _   = require('lodash'),
    mongoose = require('mongoose'),
    util    = require('util'),
    validator = require('validator');


//var a = {
//    hello: {
//        b : function(){
//            console.log(util.inspect(this));
//        }
//    }
//};
//
//a.hello.b();

function People(){
    this.name = '';
    this.age = 0;
}

People.hello = function(){
    console.log(util.inspect(this));
};

People.prototype.good = function(){
    console.log(util.inspect(this));
};

People.hello();

new People().good();