/*globals describe, before, beforeEach, afterEach, it*/
/*jshint expr:true*/
var testUtils   = require('../utils'),
    should      = require('should'),
    sequence    = require('when/sequence'),
    when        = require('when'),
    _           = require('lodash'),

    // Stuff we are testing
    versioning  = require('../../server/data/versioning'),
    exporter    = require('../../server/data/export');

describe('Exporter', function () {

    should.exist(exporter);

    // connect to mongodb first!
    before(function (done) {
        sequence([testUtils.openCon, testUtils.clearData])
            .then(function () {
                done();
            }).catch(done);
    });

    beforeEach(function (done) {
        testUtils.initData().then(function () {
            done();
        }).catch(done);
    });

    afterEach(function (done) {
        testUtils.clearData()
            .then(function () {
                done();
            }).catch(done);
    });

    // clean up the collection
    after(function (done) {
        testUtils.clearData()
            .then(function() {
                done();
            }).catch(done);
    });


    it('exports data', function (done) {
        exporter().then(function (exportData) {

            should.exist(exportData);

            should.exist(exportData.meta);
            should.exist(exportData.data);

            exportData.meta.version.should.equal('000');
            //_.findWhere(exportData.data.settings, {key: 'databaseVersion'}).value.should.equal('000');
            done();
        }).catch(done);
    });
});
