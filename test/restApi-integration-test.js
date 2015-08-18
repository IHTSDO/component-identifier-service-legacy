/**
 * Created by alo on 7/20/15.
 */
var assert = require("assert");
var should = require('should');
var security = require("../blogic/Security");
var request = require('supertest');

//request = request('http://localhost:3000/api');
var baseUrl = "http://107.170.101.181:3000/api";

var token = "";

describe('Login API', function(){
    it('should recognize username and password', function(done){
        request(baseUrl)
            .post('/login')
            .field('username', 'alopez')
            .field('password', 'snomed11')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                token = res.body.token;
                done()
            });
    });
    it('should fail with a wrong password', function(done){
        request(baseUrl)
            .post('/login')
            .field('username', 'alopez')
            .field('password', 'wrongpassword')
            .expect(401, done);
    });
    it('should list users', function(done){
        request(baseUrl)
            .get('/users?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.be.an.Array();
                res.body.should.containEql("rdavidson");
                done();
            });
    });
});

var firstUuid = guid;
var firstSctid = "";

describe('SCTIDs', function(){
    it('should generate an SCTID with no additional ids', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": firstUuid,
            "software": "Mocha Supertest",
            "comment": "Testing REST API",
            "generateLegacyIds": "false"
        };
        request(baseUrl)
            .post('/sct/generate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                firstSctid = res.body.sctid;
                res.body.additionalIds.should.be.empty();
                done();
            });
    });
    it('should generate an SCTID with additional ids', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": guid,
            "software": "Mocha Supertest",
            "comment": "Testing REST API",
            "generateLegacyIds": "true"
        };
        request(baseUrl)
            .post('/sct/generate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.additionalIds.should.not.be.empty();
                done();
            });
    });
    it('should retrieve a known sctid', function(done){
        request(baseUrl)
            .get('/sct/ids/' + firstSctid + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(firstSctid);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should retrieve a known sctid by systemId', function(done){
        request(baseUrl)
            .get('/sct/namespaces/0/systemids/' + firstUuid + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(firstSctid);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should publish a generated SCTID', function(done){
        var publicationData = {
            "sctid": firstSctid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/sct/publish?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Published");
                done();
            });
    });
    var reservedSctid = "";
    it('should reserve an SCTID', function(done){
        var reservationData = {
            "namespace": 0,
            "partitionId": "00",
            "expirationDate": "2019/09/13",
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/reserve?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                reservedSctid = res.body.sctid;
                res.body.status.should.be.eql("Reserved");
                done();
            });
    });
    it('should fail to publish a reserved SCTID before registering it', function(done){
        var publicationData = {
            "sctid": reservedSctid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/sct/publish?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect(400, done)
    });
    var secondUuid = guid;
    it('should register a reserved SCTID', function(done){
        var publicationData = {
            "sctid": reservedSctid,
            "systemId": secondUuid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
});

var firstCTV3ID = "";

describe('CTV3IDs', function() {
    it('should generate a CTV3ID', function (done) {
        var generationData = {
            "systemId": guid,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/generate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationData)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                firstCTV3ID = res.body.schemeId;
                res.body.scheme.should.be.eql("CTV3ID");
                done();
            });
    });
});

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();