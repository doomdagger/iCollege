/**
 * ## Message Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Messages,
    Message;

//Schema definition
Messages = icollegeSchema.extend("messages", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Message = mongoose.model('Message', Messages);

module.exports = {
    Message: Message,
    Messages: Messages
};