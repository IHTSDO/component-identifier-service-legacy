/**
 * Created by alo on 7/20/15.
 */
var assert = require("assert");
var should = require('should');
var http = require('http');
var request = require('supertest');
var _host="localhost"; //DEV SERVER
var _port="3000";
var _root="/api";
var baseUrl = "http://" + _host + ":" + _port + _root;

describe('Validation API', function(){
    it('should return ok with a valid id', function (done) {
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
});
