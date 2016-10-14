/**
 * Created by alo on 7/20/15.
 */
var assert = require("assert");
var should = require('should');
var http = require('http');
var request = require('supertest');
//var _host="localhost";
var _host="sctid.termspace.com";
var _port="3000";
var _root="/api";
var baseUrl = "http://" + _host + ":" + _port + _root;

describe('Validation API', function(){
    it('should return ok with a valid core id', function (done) {
        request(baseUrl)
            .get('/sct/check/404684003')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("true");
                result.sctid.should.be.equal("404684003");
                result.sequence.should.be.equal(404684);
                result.namespace.should.be.equal(0);
                result.partitionId.should.be.equal("00");
                result.checkDigit.should.be.equal(3);
                result.componentType.should.be.equal("Core concept Id");
                done()
            });
    });
    it('should return ok with a valid extension id', function (done) {
        request(baseUrl)
            .get('/sct/check/32570731000036101')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("true");
                result.sctid.should.be.equal("32570731000036101");
                result.sequence.should.be.equal(3257073);
                result.namespace.should.be.equal(1000036);
                result.partitionId.should.be.equal("10");
                result.checkDigit.should.be.equal(1);
                result.componentType.should.be.equal("Extension concept Id");
                done()
            });
    });
    it('should detect invalid check-digit', function (done) {
        request(baseUrl)
            .get('/sct/check/32570731000036102')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("false");
                done()
            });
    });
    it('should detect invalid partition for no namespace', function (done) {
        request(baseUrl)
            .get('/sct/check/404684100')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("false");
                done()
            });
    });
    it('should detect invalid partition value', function (done) {
        request(baseUrl)
            .get('/sct/check/404684093')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("false");
                done()
            });
    });
    it('should detect invalid sctid for short length', function (done) {
        request(baseUrl)
            .get('/sct/check/404')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("false");
                done()
            });
    });
    it('should detect invalid sctid for long length', function (done) {
        request(baseUrl)
            .get('/sct/check/1234567890123456789')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.isSCTIDValid.should.be.equal("false");
                done()
            });
    });
    it('should retrieve all namespaces', function (done) {
        request(baseUrl)
            .get('/sct/namespaces')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                var result = res.body;
                should.not.exist(err);
                result.length.should.be.greaterThan(2);
                done()
            });
    });
});
