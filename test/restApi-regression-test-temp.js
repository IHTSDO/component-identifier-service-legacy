/**
 * Created by alo on 7/20/15.
 */
var assert = require("assert");
var should = require('should');
var http = require('http');
var security = require("../blogic/Security");
var request = require('supertest');
var sctIdHelper=require("../utils/SctIdHelper");

//var _host="localhost";
var _host="162.243.1.200"; //DEV SERVER
var _port="3000";
var _root="/api";
var baseUrl = "http://" + _host + ":" + _port + _root;

//var username = process.env.test_username;
//var password = process.env.test_password;
var username = "arodriguez";
var password = "snomed11";
var token = "";

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
var getNewItemBase=function(){
    var newItem=new Date().getTime();
    return newItem;
};

var basesctid=getNewItemBase();


var cont=0;

var getNewSctId=function(partitionId){
    cont++;
    var newSctId=basesctid + cont;
    var newSctIdstr=newSctId.toString().substr(newSctId.toString().length-8,8) + '' + partitionId;
    var cd=sctIdHelper.verhoeffCompute (newSctIdstr );
    newSctIdstr =newSctIdstr + '' + cd;
    return newSctIdstr ;
};


var basesnomedid=getNewItemBase();

var getNewSnomedId=function(){
    cont++;
    var newSnomedId=basesnomedid + cont;
    return "R9-" + newSnomedId.toString().substr(newSnomedId.toString().length-5,5) ;
};

var basesctv3id=getNewItemBase();

var getNewCtv3Id=function(){
    cont++;
    var newCtv3Id=basesctv3id + cont;
    return newCtv3Id.toString().substr(newCtv3Id.toString().length-5,5) ;
};

var init;
function PostCode(callback) {
    var post_data = "";
        var request= {
            host: _host,
                port: _port,
                path: _root + "/bulk/jobs/" + jobId + "/?token=" + token,
                method: "GET",
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Content-Length': post_data.length,
                    'Accept': 'application/json'
                }
        };

    var job="";
    var post_req = http.request(request, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            job+=chunk;
        });
        res.on('error', function (err) {
            //console.log(' err: ' + err);
            callback(err,null);
        });
        res.on('end', function (err) {
            if (err) {
                callback(err,null);
                return;
            }
            if (job) {
                var objJob=JSON.parse(job);
                if (objJob.status != "0" && objJob.status != "1") {
                    callback(null,job);
                    return;
                }
                var stime = new Date().getTime();

                if ((stime - init) > 10000) {
                    console.log("process time: " + (stime - init));
                    callback("Postcode timeout",null);
                    return;

                }
                sleep(1000);
                PostCode(callback);
            }
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

}

var sleep=function(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
};
var getSctIdSystemIdPair=function(quantity){
    var retArray=[];
    for (var i= 0;i<quantity;i++){
        var obj={
            "sctid":getNewSctId("00"),
            "systemId":guid()
        };
        retArray.push(obj);
    }
    return retArray;
};
var getCtv3IdSystemIdPair=function(quantity){
    var retArray=[];
    for (var i= 0;i<quantity;i++){
        var obj={
            "schemeId":getNewCtv3Id(),
            "systemId":guid()
        };
        retArray.push(obj);
    }
    return retArray;
};
var getSnomedIdSystemIdPair=function(quantity){
    var retArray=[];
    for (var i= 0;i<quantity;i++){
        var obj={
            "schemeId":getNewSnomedId(),
            "systemId":guid()
        };
        retArray.push(obj);
    }
    return retArray;
};


describe('Login API', function(){
    it('should recognize username and password (Auth_01)', function(done){
        request(baseUrl)
            .post('/login')
            .field('username', username)
            .field('password', password)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                token = res.body.token;
                done()
            });
    });
    //it('should fail with a wrong username (Auth_02)', function(done){
    //    request(baseUrl)
    //        .post('/login')
    //        .field('username', 'wrongusername')
    //        .field('password', password)
    //        .expect(401, done);
    //});
    //it('should fail with a wrong password (Auth_03)', function(done){
    //    request(baseUrl)
    //        .post('/login')
    //        .field('username', username)
    //        .field('password', 'wrongpassword')
    //        .expect(401, done);
    //});
    //it('should list users', function(done){
    //    request(baseUrl)
    //        .get('/users?token=' + token)
    //        .set('Accept', 'application/json')
    //        .expect('Content-Type', /json/)
    //        .expect(200)
    //        .end(function(err, res) {
    //            if (err) return done(err);
    //            res.body.should.be.an.Array();
    //            res.body.should.containEql("rdavidson");
    //            done();
    //        });
    //});
});

var firstSctid = "";
var sctIdWithAdditionalIds="";
var sysIdWithAdditionalIds="";
var knownUuidMock = guid();
var unknownUuidMock=guid();
var newSysId;
var deprecatedSystemId;
var reservedSctid = "";
var reservedSystemId = "";

var firstCTV3ID = "";
var firstSNOMEDID = "";
var sctidArray=[];
var sysIds="";
var sysSnomedIds="";
var snomedIdArray=[];
var ctv3IdArray=[];
var jobId=0;
var retArray=[];
var retSnomedIdArray=[];

describe('SCTID  BULK', function() {

    it('Test bulk generate api for 100000 brand new SctIDs (BulkSctId_01)', function (done) {
        var sysId1 = guid();
        var sysId2 = guid();

        var quantity=100000;
        var generationData = {
            "namespace": 0,
            "partitionId": "02",
            "quantity": quantity,
            "systemIds": [],
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/generate/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationData)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.id.should.not.be.null();
                jobId = res.body.id;
                init = new Date().getTime();

                PostCode(function (err, job) {
                    if (err) {
                        return done(err);
                    }
                    if (job) {
                        var objJob = JSON.parse(job);
                        request(baseUrl)
                            .get('/bulk/jobs/' + jobId + '/records/?token=' + token)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.should.not.be.null();
                                res.body.length.should.be.eql(quantity);
                                //res.body[0].jobId.should.be.eql(jobId);
                                //res.body[0].status.should.be.eql("Assigned");
                                sctidArray.push(res.body[0].sctid);
                                sctidArray.push(res.body[1].sctid);
                                //sysIds = res.body[0].systemId + "," + res.body[1].systemId;
                                res=null;
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });
});