/**
 * ## Circle Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Circles,
    Circle;

//Schema definition
Circles = icollegeSchema.extend("circles", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Circle = mongoose.model('Circle', Circles);

module.exports = {
    Circle: Circle,
    Circles: Circles
};