var assert = require("assert");
var should = require('should');
var namespace = require("../blogic/NamespaceDataManager");
var sctId = require("../blogic/SCTIdDataManager");
var stateMachine=require("../model/StateMachine");

var sctIdRecord={};
sctIdRecord.namespace= 0 ;
sctIdRecord.partitionId="00";
sctIdRecord.systemId = "Test System";
sctIdRecord.status = "";
sctIdRecord.author = "Ale";
sctIdRecord.software = "Test soft";
sctIdRecord.expirationDate = "2015-08-01";
sctIdRecord.comment = "Test comment";

var registerSystemId="0045754c-85df-b333-30a6-aadd164dfdd1";
var reservedSctId="";
var assignedSctId="";
describe('Namespaces', function() {

    describe('#deleteNamespace()', function () {
        it('should delete a namespace', function (done) {
            namespace.deleteNamespace(sctIdRecord.namespace,function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });
    describe('#createNamespace()', function () {
        it('should create a namespace', function (done) {

            namespace.createNamespace({
                namespace: sctIdRecord.namespace,
                organizationName: "AR user",
                email: "ale@sdadasd.cpm"
            }, function (err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });
});

describe('SCTIDS', function() {

    describe('#removeSctId()', function () {
        it('should remove all sctId for the namespace', function (done) {
            sctId.removeSctId({namespace: sctIdRecord.namespace}
                , function (err, data) {
                    if (err) throw err;
                    should.not.exist(err);

                    done();
                });
        });
    });
    describe('#generateSctid()', function () {
        it('should generate a sctId for the namespace', function (done) {
            sctId.generateSctid({
                namespace: sctIdRecord.namespace,
                partitionId: sctIdRecord.partitionId,
                systemId: sctIdRecord.systemId,
                author: sctIdRecord.author,
                software: sctIdRecord.software,
                expirationDate: sctIdRecord.expirationDate,
                comment: sctIdRecord.comment
            }, function (err, newSctIdRecord) {
                if (err) throw err;
                should.not.exist(err);

                newSctIdRecord.should.not.be.equal(null);
                newSctIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
                assignedSctId=newSctIdRecord.sctid;
                done();
            });
        });
    });


    describe('#reserveSctid()', function () {
        it('should reserve a sctId for the namespace', function (done) {
            sctId.reserveSctid({
                namespace: sctIdRecord.namespace,
                partitionId: sctIdRecord.partitionId,
                systemId: sctIdRecord.systemId,
                author: sctIdRecord.author,
                software: sctIdRecord.software,
                expirationDate: sctIdRecord.expirationDate,
                comment: sctIdRecord.comment
            }, function (err, newSctIdRecord) {
                if (err) throw err;
                should.not.exist(err);

                newSctIdRecord.should.not.be.equal(null);
                newSctIdRecord.status.should.be.equal(stateMachine.statuses.reserved);
                reservedSctId=newSctIdRecord.sctid;
                done();
            });
        });
    });


    describe('#registerSctid()', function () {
        it('should register a sctId for the namespace', function (done) {
            sctId.registerSctid({
                sctid: "900000000000003001",
                namespace: sctIdRecord.namespace,
                partitionId: "00",
                systemId: registerSystemId,
                author: sctIdRecord.author,
                software: sctIdRecord.software,
                expirationDate: sctIdRecord.expirationDate,
                comment: sctIdRecord.comment
            }, function (err, newSctIdRecord) {
                if (err) throw err;
                should.not.exist(err);

                newSctIdRecord.should.not.be.equal(null);
                newSctIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
                done();
            });
        });
    });


    describe('#getSctid()', function () {
        it('should getter a sctId for the namespace', function (done) {
            sctId.getSctid("900000000000003001"
                , function (err, newSctIdRecord) {
                    if (err) throw err;
                    should.not.exist(err);

                    newSctIdRecord.should.not.be.equal(null);
                    newSctIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
                    //sctIdRecord = newSctIdRecord;
                    done();
                });
        });
    });

    describe('#getSctidBySystemId()', function () {
        it('should getter a sctId by systemId for the namespace', function (done) {
            sctId.getSctidBySystemId(0,
                registerSystemId,
                function (err, newSctIdRecord) {
                    if (err) throw err;
                    should.not.exist(err);

                    newSctIdRecord.should.not.be.equal(null);
                    newSctIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
                    done();
                });
        });
    });

    describe('#releaseSctid()', function () {
        it('should release a sctId for the namespace', function (done) {
            sctId.releaseSctid({
                    sctid: reservedSctId,
                    namespace: sctIdRecord.namespace,
                    software: sctIdRecord.software,
                    comment: sctIdRecord.comment
                }
                ,function (err, newSctIdRecord) {
                    if (err) throw err;
                    should.not.exist(err);

                    newSctIdRecord.should.not.be.equal(null);
                    newSctIdRecord.status.should.be.equal(stateMachine.statuses.available);
                    done();
                });
        });
    });

    describe('#publishSctid()', function () {
        it('should publish a sctId for the namespace', function (done) {
            sctId.publishSctid({
                    sctid: assignedSctId,
                    namespace: sctIdRecord.namespace,
                    software: sctIdRecord.software,
                    comment: sctIdRecord.comment
                }
                ,function (err, newSctIdRecord) {
                    if (err) throw err;
                    should.not.exist(err);

                    newSctIdRecord.should.not.be.equal(null);
                    newSctIdRecord.status.should.be.equal(stateMachine.statuses.published);
                    done();
                });
        });
    });

    describe('#deprecateSctid()', function () {
        it('should deprecate a sctId for the namespace', function (done) {
            sctId.deprecateSctid({
                    sctid: assignedSctId,
                    namespace: sctIdRecord.namespace,
                    software: sctIdRecord.software,
                    comment: sctIdRecord.comment
                }
                ,function (err, newSctIdRecord) {
                    if (err) throw err;
                    should.not.exist(err);

                    newSctIdRecord.should.not.be.equal(null);
                    newSctIdRecord.status.should.be.equal(stateMachine.statuses.deprecated);
                    done();
                });
        });
    });

    describe('#checkSctid()', function () {
        it('should deprecate a sctId for the namespace', function (done) {
            sctId.checkSctid("404684003",function (err, result) {
                if (err) throw err;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("true");
                result.sctid.should.be.equal("404684003");
                result.sequence.should.be.equal("404684");
                result.namespace.should.be.equal("0");
                result.partitionId.should.be.equal("00");
                result.checkDigit.should.be.equal("3");
                result.componentType.should.be.equal("Core concept Id");
                done();
            });
        });
    });
});
