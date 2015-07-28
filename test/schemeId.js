var assert = require("assert");
var should = require('should');
var schemeId = require("../blogic/SchemeIdDataManager");
var stateMachine=require("../model/StateMachine");

var schemeIdRecord={};
schemeIdRecord.scheme="CTV3ID";
schemeIdRecord.systemId = "Test System";
schemeIdRecord.status = "";
schemeIdRecord.author = "Ale";
schemeIdRecord.software = "Test soft";
schemeIdRecord.expirationDate = "2015-08-01";
schemeIdRecord.comment = "Test comment";

var registerSystemId="0045754c-85df-b333-30a6-bbdd164dfdd1";
var reservedSchemeId="";
var assignedSchemeId="";
var model;
var db;
describe('SCHEMIDS', function () {


    describe('#initializeScheme()', function () {
        it('should remove all schemeId for the scheme', function (done) {
            schemeId.initializeScheme(schemeIdRecord.scheme,
                "XUzzz"
                , function (err, data) {
                    if (err) throw err;
                    should.not.exist(err);

                    done();
                });
        });
    });
//
//    describe('#removeSchemeId()', function () {
//        it('should remove all schemeId for the scheme', function (done) {
//            schemeId.removeSchemeId({scheme: schemeIdRecord.scheme}
//                , function (err, data) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    done();
//                });
//        });
//    });
//    describe('#generateSchemeId()', function () {
//        it('should generate a schemeId for the scheme', function (done) {
//            schemeId.generateSchemeId(
//                schemeIdRecord.scheme, {
//                    systemId: schemeIdRecord.systemId,
//                    author: schemeIdRecord.author,
//                    software: schemeIdRecord.software,
//                    expirationDate: schemeIdRecord.expirationDate,
//                    comment: schemeIdRecord.comment
//                }, function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
//                    assignedSchemeId = newSchemeIdRecord.schemeId;
//                    done();
//                });
//        });
//    });
//
//
//    describe('#reserveSchemeId()', function () {
//        it('should reserve a schemeId for the scheme', function (done) {
//            schemeId.reserveSchemeId(
//                schemeIdRecord.scheme, {
//                    systemId: schemeIdRecord.systemId,
//                    author: schemeIdRecord.author,
//                    software: schemeIdRecord.software,
//                    expirationDate: schemeIdRecord.expirationDate,
//                    comment: schemeIdRecord.comment
//                }, function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.reserved);
//                    reservedSchemeId = newSchemeIdRecord.schemeId;
//                    done();
//                });
//        });
//    });
//
//
//    describe('#registerSchemeId()', function () {
//        it('should register a schemeId for the scheme', function (done) {
//            schemeId.registerSchemeId(
//                schemeIdRecord.scheme, {
//                    schemeId: "XVa50",
//                    systemId: registerSystemId,
//                    author: schemeIdRecord.author,
//                    software: schemeIdRecord.software,
//                    expirationDate: schemeIdRecord.expirationDate,
//                    comment: schemeIdRecord.comment
//                }, function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
//                    done();
//                });
//        });
//    });
//
//
//    describe('#getSchemeId()', function () {
//        it('should getter a schemeId for the scheme', function (done) {
//            schemeId.getSchemeId(
//                schemeIdRecord.scheme,
//                "XVa50"
//                , function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
//                    //schemeIdRecord = newSchemeIdRecord;
//                    done();
//                });
//        });
//    });
//
//    describe('#getSchemeIdBySystemId()', function () {
//        it('should getter a schemeId by systemId for the scheme', function (done) {
//            schemeId.getSchemeIdBySystemId(
//                schemeIdRecord.scheme,
//                registerSystemId,
//                function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.assigned);
//                    done();
//                });
//        });
//    });
//
//    describe('#releaseSchemeId()', function () {
//        it('should release a schemeId for the scheme', function (done) {
//            schemeId.releaseSchemeId(
//                schemeIdRecord.scheme, {
//                    schemeId: reservedSchemeId,
//                    software: schemeIdRecord.software,
//                    comment: schemeIdRecord.comment
//                }
//                , function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.available);
//                    done();
//                });
//        });
//    });
//
//    describe('#publishSchemeId()', function () {
//        it('should publish a schemeId for the scheme', function (done) {
//            schemeId.publishSchemeId(
//                schemeIdRecord.scheme, {
//                    schemeId: assignedSchemeId,
//                    software: schemeIdRecord.software,
//                    comment: schemeIdRecord.comment
//                }
//                , function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.published);
//                    done();
//                });
//        });
//    });
//
//    describe('#deprecateSchemeId()', function () {
//        it('should deprecate a schemeId for the scheme', function (done) {
//            schemeId.deprecateSchemeId(
//                schemeIdRecord.scheme, {
//                    schemeId: assignedSchemeId,
//                    software: schemeIdRecord.software,
//                    comment: schemeIdRecord.comment
//                }
//                , function (err, newSchemeIdRecord) {
//                    if (err) throw err;
//                    should.not.exist(err);
//
//                    newSchemeIdRecord.should.not.be.equal(null);
//                    newSchemeIdRecord.status.should.be.equal(stateMachine.statuses.deprecated);
//                    done();
//                });
//        });
//    });
});

