/**
 * ## Repost Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Reposts,
    Repost;

//Schema definition
Reposts = icollegeSchema.extend("reposts", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Repost = mongoose.model('Repost', Reposts);

module.exports = {
    Repost: Repost,
    Reposts: Reposts
};