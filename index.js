/**
 * Created by Li He on 2014/5/23.
 */
var debug = require('debug')('generated-express-app');
var app = require('./core');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
