
var base = require('../../server/storage/base'),
    _   = require('lodash'),
    //mongoose = require('mongoose'),
    redis   = require('redis'),
    util    = require('util');
    //validator = require('validator');


var client = redis.createClient();

client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);

//function People(){
//    this.name = '';
//    this.age = 0;
//}
//
//People.prototype.good = function(){
//    console.log('hello');
//};
//
//function Employee(){
//
//}
//
//Employee.prototype.__proto__ = People.prototype;
//
//var emp = new Employee();
//
//emp.good();