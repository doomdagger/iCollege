/**
 * ## Notification Model
 * Created by balcat on 7/24/2014.
 */

var mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Notifications,
    Notification;

//Schema definition
Notifications = icollegeSchema.extend("notifications", {
    //statics here

}, {
    //methods here

}, [
    //plugins here

]);

//Model definition
Notification = mongoose.model('Notification', Notifications);

module.exports = {
    Notification: Notification,
    Notifications: Notifications
};