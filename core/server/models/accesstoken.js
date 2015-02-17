// # Accesstoken Model

var basetokenShelf  = require('./basetoken'),

    Accesstoken,
    Accesstokens;

Accesstokens = basetokenShelf.schema('accesstokens');

Accesstoken = basetokenShelf.model('Accesstoken', Accesstokens);

module.exports = {
    Accesstoken: Accesstoken,
    Accesstokens: Accesstokens
};
