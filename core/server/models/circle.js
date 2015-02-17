// # Circle Model

var icollegeShelf = require('./base'),
    Circle,
    Circles;

Circles = icollegeShelf.schema('circles', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Circle = icollegeShelf.model('Circle', Circles);


module.exports = {
    Circle: Circle,
    Circles: Circles
};
