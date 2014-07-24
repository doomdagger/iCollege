/**
 * ## Group Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Groups,
    Group;

//Schema definition
Groups = icollegeSchema.extend("groups", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Group = mongoose.model('Group', Groups);

module.exports = {
    Group: Group,
    Groups: Groups
};