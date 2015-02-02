var Basetoken       = require('./basetoken'),

    Refreshtoken,
    Refreshtokens;

Refreshtokens = Basetoken.schema('refreshtokens');

Refreshtoken = Basetoken.model('Refreshtoken', Refreshtokens);


module.exports = {
    Refreshtoken: Refreshtoken,
    Refreshtokens: Refreshtokens
};
