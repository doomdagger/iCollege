
var Basetoken       = require('./basetoken'),

    Accesstoken,
    Accesstokens;

Accesstokens = Basetoken.schema('accesstokens');

Accesstoken = Basetoken.model('Accesstoken', Accesstokens);

module.exports = {
    Accesstoken: Accesstoken,
    Accesstokens: Accesstokens
};
