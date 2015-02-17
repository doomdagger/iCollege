// # Notification Model

var icollegeShelf = require('./base'),
    Notification,
    Notifications;

Notifications = icollegeShelf.schema('notifications', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Notification = icollegeShelf.model('Notification', Notifications);


module.exports = {
    Notification: Notification,
    Notifications: Notifications
};
