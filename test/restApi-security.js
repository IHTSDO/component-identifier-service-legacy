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

describe('POST /login', function(){
    it('respond with json key', function(done){
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
    })
});

describe('GET /users', function(){
    it('respond with json', function(done){
        request(baseUrl)
            .get('/users?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                done()
            });
    })
});