/**
 * ## Post Model
 * Created by balcat on 7/24/2014.
 * Updated by Li He on 7/25/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Posts,
    Post;

//Schema definition
Posts = icollegeSchema.extend('posts', {
    //statics here
}, {
    //methods here
}, [
    //plugins here
]);

//Model definition
Post = mongoose.model('Post', Posts);

module.exports = {
    Post: Post,
    Posts: Posts
};