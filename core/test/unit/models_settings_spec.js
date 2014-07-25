/**
 * Created by Li He on 2014/7/25.
 */
var Setting = require('../../server/models/settings').Setting,
    initDB = require('../../server/models').init,
    config     = require('../../server/config'),
    sequence = require('when/sequence'),
    should = require('should'),
    when = require('when'),
    node_uuid = require('node-uuid');


describe('Models Test for Setting Model', function(){
    var valid_setting = new Setting({
        uuid: node_uuid.v4(),
        key: "defaultLang",
        value: "zh_CH",
        type: "user"
    });
    var mal_setting = new Setting({
        uuid: node_uuid.v4(),
        key: "defaultLang",
        type: "user"
    });

    describe('#methods.validate()', function(){
        it('should fail for the lacking value property', function(done){
            mal_setting.validate().catch(function(value) {
                value.length.should.equal(1);
                value[0].message.should.equal("Settings validation (isNull) failed for defaultLang");
                return done();
            });
        });

        it('should success with no lacking properties', function(done){
            valid_setting.validate().then(function() {
                return done();
            }).catch(done);

        });
    });

//    describe('#methods.populateDefault', function(){
//        it('populate a specific key for database', function(done){
//            sequence([initDB, Setting.populateDefault], 'databaseVersion').then(function (ret) {
//                ret[1].key.should.equal('databaseVersion');
//                return done();
//            }).catch(done);
//        });
//    });

    describe('#methods.populateDefaults', function(){
        it('populate all keys with default values for database', function(done){
            sequence([initDB, Setting.populateDefaults]).then(function () {
                return done();
            }).catch(done);
        });
    });

});