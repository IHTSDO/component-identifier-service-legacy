/**
 * Created by alo on 10/13/16.
 */
var assert = require("assert");
var should = require('should');
var sctId = require("../blogic/SCTIdDataManager");

describe('Public API', function() {
    describe('#checkSctid()', function () {
        it('should return ok with a valid id', function (done) {
            sctId.checkSctid("404684003",function (err, result) {
                if (err) throw err;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("true");
                result.sctid.should.be.equal("404684003");
                result.sequence.should.be.equal(404684);
                result.namespace.should.be.equal(0);
                result.partitionId.should.be.equal("00");
                result.checkDigit.should.be.equal(3);
                result.componentType.should.be.equal("Core concept Id");
                done();
            });
        });
    });
});
