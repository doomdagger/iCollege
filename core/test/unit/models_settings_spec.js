/**
 * Created by Li He on 2014/7/25.
 */
var dataProvider = require('../../server/models'),
    sequence = require('when/sequence'),
    when = require('when'),
    should = require('should'),
    node_uuid = require('node-uuid'),
    utils = require('../../server/data/utils');


describe('Models Test for Setting Model', function(){

    var valid_setting = new dataProvider.Setting({
        uuid: node_uuid.v4(),
        key: "defaultLang",
        value: "zh_CH",
        type: "user"
    });
    var mal_setting = new dataProvider.Setting({
        uuid: node_uuid.v4(),
        key: "defaultLang",
        type: "user"
    });

    // connect to mongodb first!
    before(function (done) {
        dataProvider.init().then(function () {
            return done();
        }).catch(done);
    });

    // clean up the collection
//    after(function (done) {
//        utils.dropCollection('settings').then(function() {
//            return done();
//        }).catch(done);
//    });

    describe('#methods.validate()', function () {
        it('should fail for the lacking value property', function(done){
            mal_setting.validateSetting().catch(function(value) {
                value.length.should.equal(1);
                value[0].message.should.equal("Settings validation (isNull) failed for defaultLang");
                return done();
            });
        });

        it('should success with no lacking properties', function(done){
            valid_setting.validateSetting().then(function() {
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
            // bind 'this' to dataProvider.Setting
            dataProvider.Setting.populateDefaults = dataProvider.Setting.populateDefaults.bind(dataProvider.Setting);

            dataProvider.Setting.populateDefaults().then(function () {
                return done();
            }).catch(done);
        });
    });

});