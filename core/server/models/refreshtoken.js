var basetokenShelf  = require('./basetoken'),

    Refreshtoken,
    Refreshtokens;

Refreshtokens = basetokenShelf.schema('refreshtokens');

Refreshtoken = basetokenShelf.model('Refreshtoken', Refreshtokens);


module.exports = {
    Refreshtoken: Refreshtoken,
    Refreshtokens: Refreshtokens
};
