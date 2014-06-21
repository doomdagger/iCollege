var  should = require('should'),
     when = require('when');


describe('Demo Unit Test Module, Use Mocha plus Should.js', function(){

    var global_arr = [];

    beforeEach(function(){
        global_arr = [1,2,3,4,5,6,7,8];
    });

    afterEach(function(){
        global_arr = [];
    });

    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            [1,2,3].indexOf(5).should.equal(-1);
            [1,2,3].indexOf(0).should.equal(-1);
        })
    });




});