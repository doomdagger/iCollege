/**
 * ## Re_post Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Re_posts,
    Re_post;

//Schema definition
Re_posts = icollegeSchema.extend("re_posts", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Re_post = mongoose.model('Re_post', Re_posts);

module.exports = {
    Re_post: Re_post,
    Re_posts: Re_posts
};