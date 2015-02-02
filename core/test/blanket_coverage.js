// Posts
/*jshint unused:false */
var blanket = require('blanket')({
        pattern: ['/core/server/', '/core/shared/'],
        'data-cover-only': ['/core/server/', '/core/shared/']
    }),
    requireDir = require('require-dir');

requireDir('./unit');
requireDir('./integration');
requireDir('./functional/routes');
