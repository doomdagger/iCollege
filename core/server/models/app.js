// # App Model

var icollegeShelf = require('./base'),
    App,
    Apps;

Apps = icollegeShelf.schema('apps', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

App = icollegeShelf.model('App', Apps);


module.exports = {
    App: App,
    Apps: Apps
};
