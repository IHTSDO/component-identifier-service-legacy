/**
 * Created by alo on 7/20/15.
 */
var assert = require("assert");
var should = require('should');
var security = require("../blogic/Security");
var request = require('supertest');

//request = request('http://localhost:3000/api');
var baseUrl = "http://localhost:3000/api";

//describe('GET /users', function(){
//    it('respond with json', function(done){
//        request(baseUrl)
//            .get('/users?token=ymBPALanrqy8VYIAkL1tQw00')
//            .set('Accept', 'application/json')
//            .expect('Content-Type', /json/)
//            .expect(200)
//            .end(function(err, res){
//                if (err) return done(err);
//                done()
//            });
//    })
//});