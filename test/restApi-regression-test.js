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
var _host="107.170.138.113";
var _port="3000";
var _root="/api";
var baseUrl = "http://" + _host + ":" + _port + _root;

var username = process.env.test_username;
var password = process.env.test_password;

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
    it('should fail with a wrong username (Auth_02)', function(done){
        request(baseUrl)
            .post('/login')
            .field('username', 'wrongusername')
            .field('password', password)
            .expect(401, done);
    });
    it('should fail with a wrong password (Auth_03)', function(done){
        request(baseUrl)
            .post('/login')
            .field('username', username)
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

var firstSctid = "";
var sctIdWithAdditionalIds="";
var sysIdWithAdditionalIds="";
var knownUuidMock = guid();
var unknownUuidMock=guid();
var newSysId;
var deprecatedSystemId;
var reservedSctid = "";
var reservedSystemId = "";
describe('SCTIDs', function(){
    it('should generate an SCTID with no additional ids (SingleSctId_01)', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": "",
            "software": "Mocha Supertest",
            "comment": "Testing REST API (SingleSctId_01)",
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
    it('should generate an SCTID with additional ids (SingleSctId_02)', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": "",
            "software": "Mocha Supertest",
            "comment": "Testing REST API (SingleSctId_02)",
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
                sctIdWithAdditionalIds = res.body.sctid;
                sysIdWithAdditionalIds = res.body.systemId;
                done();
            });
    });
    var sctidToRetrieveBySystemId = "";
    it('should generate an SCTID with a known SystemId (SingleSctId_03)', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": knownUuidMock,
            "software": "Mocha Supertest",
            "comment": "Testing REST API (SingleSctId_03)",
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
                sctidToRetrieveBySystemId = res.body.sctid;
                res.body.systemId.should.be.eql(knownUuidMock);
                done();
            });
    });
    it('should retrieve a null SCTID with a unknown SystemId (SingleSctId_04)', function(done){
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "systemId": unknownUuidMock,
            "software": "Mocha Supertest",
            "comment": "Testing REST API",
            "generateLegacyIds": "false"
        };
        request(baseUrl)
            .get('/sct/namespaces/0/systemids/' + unknownUuidMock + '?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                should.not.exist(res.body);
                done();
            });
    });
    it('should retrieve a known schemeid by systemId (SingleSctId_05)', function(done){
        request(baseUrl)
            .get('/sct/namespaces/0/systemids/' + knownUuidMock + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(sctidToRetrieveBySystemId);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should retrieve a known schemeid without its legacy ids (SingleSctId_07)', function(done){
        request(baseUrl)
            .get('/sct/ids/' + sctIdWithAdditionalIds + '?token=' + token )
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(sctIdWithAdditionalIds);
                should.not.exist(res.body.additionalIds);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });

    it('should retrieve a known schemeid and its legacy ids (SingleSctId_06)', function(done){
        request(baseUrl)
            .get('/sct/ids/' + sctIdWithAdditionalIds + '?token=' + token + '&includeAdditionalIds=true')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(sctIdWithAdditionalIds);
                res.body.additionalIds.should.not.be.empty();
                res.body.additionalIds[0].systemId.should.be.eql(sysIdWithAdditionalIds);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('Test the limit parameter in Get /sct/ids (SingleSctId_08)', function(done){
        request(baseUrl)
            .get('/sct/ids/?token=' + token + '&limit=1&=skip=0&namespace=0')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.empty();
                res.body.length.should.be.eql(1);
                done();
            });
    });
    var newSctId="";
    it('should register a non existing SCTID (SingleSctId_09)', function(done){
        newSctId=getNewSctId("00");
        newSysId=guid();
        var registrationData = {
            "sctid": newSctId,
            "systemId": newSysId,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.sctid.should.be.eql(newSctId);
                res.body.systemId.should.be.eql(newSysId);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });


    it('should reserve an SCTID (SingleSctId_10)', function(done){
        var reservationData = {
            "namespace": 0,
            "partitionId": "00",
            "expirationDate": "2019/09/13",
            "software": "Mocha Supertest",
            "comment": "Testing REST API (SingleSctId_10)"
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
                reservedSystemId = res.body.systemId;
                res.body.status.should.be.eql("Reserved");
                done();
            });
    });

    it('should release a generated SCTID (SingleSctId_11)', function(done){
        var releaseData = {
            "sctid": newSctId,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/sct/release?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(releaseData)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Available");
                done();
            });
    });
    it('should publish a assigned SCTID (SingleSctId_12)', function(done){
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
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Published");
                done();
            });
    });
    it('should deprecate a published SCTID (SingleSctId_13)', function(done){
        var deprecationData = {
            "sctid": firstSctid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/sct/deprecate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(deprecationData)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Deprecated");
                deprecatedSystemId= res.body.systemId;
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
            .expect(400)
            .end(function(err, res) {
                done();
            });
    });
    it('should register a reserved SCTID with same systemId that was reserved', function(done){
        var registrationData = {
            "sctid": reservedSctid,
            "systemId": reservedSystemId,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });

    it('should fail to register a reserved SCTID with other existing systemId ', function(done){
        var registrationData = {
            "sctid": reservedSctid,
            "systemId": newSysId,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
            .expect(400)
            .end(function(err, res) {
                done();
            });

    });

    it('should register a reserved SCTID providing a new systemId', function(done){
        var secondReservationSctid = "";
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
                secondReservationSctid = res.body.sctid;
                res.body.status.should.be.eql("Reserved");
                var newUuid = guid();
                var registrationData = {
                    "sctid": secondReservationSctid,
                    "systemId": newUuid,
                    "namespace": 0,
                    "software": "Mocha Supertest",
                    "comment": "Testing REST API"
                };
                request(baseUrl)
                    .post('/sct/register?token=' + token)
                    .set('Accept', 'application/json')
                    .set('Content-type', 'application/json')
                    .send(registrationData)
                    .expect(200)
                    .end(function(err, res) {
                        //console.log(res);
                        if (err) return done(err);
                        res.body.sctid.should.be.eql(secondReservationSctid);
                        res.body.systemId.should.be.eql(newUuid);
                        res.body.status.should.be.eql("Assigned");
                        done();
                    });
            });
    });

    it('should publish a existing registered SCTID (SingleSctId_14)', function(done){

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
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.sctid.should.not.be.null();
                res.body.status.should.be.eql("Published");
                done();
            });
    });
});

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

    it('Test bulk generate api for 2 brand new SctIDs (BulkSctId_01)', function (done) {
        var sysId1 = guid();
        var sysId2 = guid();
        var generationData = {
            "namespace": 0,
            "partitionId": "00",
            "quantity": 2,
            "systemIds": [sysId1, sysId2],
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
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                sctidArray.push(res.body[0].sctid);
                                sctidArray.push(res.body[1].sctid);
                                sysIds = res.body[0].systemId + "," + res.body[1].systemId;
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
    it('Test bulk publish api for 2 assigned SctIDs (BulkSctId_02)', function (done) {
        var publicationData = {
            "sctids": sctidArray,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/sct/bulk/publish/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.id.should.not.be.null();
                jobId = res.body.id;
                res=null;
                init = new Date().getTime();
                PostCode(function (err, job) {
                    if (err) {
                        return done(err);
                    }
                    if (job) {
                        var objJob = JSON.parse(job);

                        request(baseUrl)
                            .get('/bulk/jobs/' + jobId + '/records?token=' + token + "&=" + new Date().getTime())
                            .set('Accept', 'application/json')
                            .set('Content-type', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err2, res2) {
                                //console.log(res);
                                if (err2) return done(err2);
                                objJob.status.should.be.eql("2");
                                res2.body.length.should.be.eql(2);
                                res2.body[0].jobId.should.be.eql(jobId);
                                res2.body[0].status.should.be.eql("Published");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk get SctIds by system ids (BulkSctId_03)', function (done) {

        request(baseUrl)
            .get('/sct/namespace/0/systemIds/?token=' + token + '&systemIds=' + sysIds)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.length.should.be.eql(2);
                done();
            });

    });
    it('Test bulk get SctIds by known SCTIDs (BulkSctId_04)', function (done) {
        var sctIds = sctidArray[0] + "," + sctidArray[1];

        request(baseUrl)
            .get('/sct/bulk/ids/?token=' + token + '&sctids=' + sctIds)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.length.should.be.eql(2);
                done();
            });

    });

    it('Test bulk register SCTIDs (BulkSctId_05)', function (done) {
        var pair = getSctIdSystemIdPair(2);
        var registrationData = {
            "records": pair,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk reserve SCTIDs (BulkSctId_06)', function (done) {
        var reservationData = {
            "namespace": 0,
            "partitionId": "01",
            "expirationDate": "2016-01-01",
            "quantity": 20,
            "software": "Mocha Supertest",
            "comment": "Testing reserve SCTID REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/reserve/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationData)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(20);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Reserved");
                                var obj1 = {
                                    "sctid": res.body[0].sctid,
                                    "systemId": res.body[0].systemId
                                };
                                retArray.push(obj1);
                                var obj2 = {
                                    "sctid": res.body[1].sctid,
                                    "systemId": res.body[1].systemId
                                };
                                retArray.push(obj2);
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();
                    }
                });
            });
    });

    it('Test bulk register SCTIDs with same systemId that were reserved', function (done) {
        var registrationData = {
            "records": retArray,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                if (res.body[0].sctid == retArray[0].sctid) {
                                    res.body[0].systemId.should.be.eql(retArray[0].systemId);
                                } else {
                                    res.body[0].systemId.should.be.eql(retArray[1].systemId);
                                }
                                if (res.body[1].sctid == retArray[1].sctid) {
                                    res.body[1].systemId.should.be.eql(retArray[1].systemId);
                                } else {
                                    res.body[1].systemId.should.be.eql(retArray[0].systemId);
                                }
                                res.body[0].status.should.be.eql("Assigned");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk should fail to register SCTIDs with other existing systemId', function (done) {
        retArray[1].systemId=deprecatedSystemId;
        var registrationData = {
            "records": retArray,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing fail register REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("3");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });


    it('Test clean up reserved and expired SCTIDs ', function (done) {
        var reservationData = {
            "namespace": 0,
            "partitionId": "02",
            "expirationDate": "2014-01-01",
            "quantity": 20,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/sct/bulk/reserve/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationData)
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
                            .get('/bulk/jobs/cleanupExpired?token=' + token)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                                //console.log(res);
                                if (err) return done(err);
                                request(baseUrl)
                                    .get('/bulk/jobs/' + jobId + '/records?token=' + token)
                                    .set('Accept', 'application/json')
                                    .expect('Content-Type', /json/)
                                    .expect(200)
                                    .end(function (err, res) {
                                        //console.log(res);
                                        if (err) return done(err);
                                        res.body.length.should.be.eql(20);
                                        for (var i = 0; i < res.body.length; i++) {
                                            //console.log(res.body[i].schemeid);
                                            res.body[i].jobId.should.be.eql(jobId);
                                            //console.log(res.body[i].status);
                                            res.body[i].status.should.be.eql("Available");
                                        }
                                        done();
                                    });
                            });
                    }else {
                        should.exist(job);
                        done();
                    }
                });
            });
    });

});

var ctv3Uuid=guid();
var snomedIDUuid=guid();
var reservedCtv3Id;
var reservedSystemId;
var reservedSnomedId;
var reservedSnomedSysId;
describe('SchemeIds', function(){

    it('should generate a CTV3ID (Single_SchemeId_test_01)', function (done) {
        var generationMetadata = {
            "systemId": ctv3Uuid,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/generate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationMetadata)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                firstCTV3ID = res.body.schemeId;
                res.body.scheme.should.be.eql("CTV3ID");
                done();
            });
    });

    it('should retrieve a known CTV3Id (Single_SchemeId_test_02)', function(done){
        request(baseUrl)
            .get('/scheme/CTV3ID/ids/' + firstCTV3ID + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.schemeId.should.not.be.null();
                res.body.systemId.should.be.eql(ctv3Uuid);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should generate a SNOMEDID (Single_SchemeId_test_03)', function (done) {
        var generationMetadata = {
            "systemId": snomedIDUuid,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/generate?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationMetadata)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                firstSNOMEDID = res.body.schemeId;
                res.body.scheme.should.be.eql("SNOMEDID");
                done();
            });
    });

    it('should retrieve a known SNOMEDID (Single_SchemeId_test_04)', function(done){
        request(baseUrl)
            .get('/scheme/SNOMEDID/ids/' + firstSNOMEDID + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.schemeId.should.not.be.null();
                res.body.systemId.should.be.eql(snomedIDUuid);
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });

    it('should register a CTV3ID (Single_SchemeId_test_05)', function(done){
        var registrationMetadata = {
            "schemeId": getNewCtv3Id(),
            "systemId": guid(),
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should register a SnomedID (Single_SchemeId_test_06)', function(done){
        var registrationMetadata = {
            "schemeId": getNewSnomedId(),
            "systemId": guid(),
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });

    it('should reserve a CTV3ID (Single_SchemeId_test_07)', function(done){
        var reservationMetadata = {
            "expirationDate": "2019/09/30",
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/reserve?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                reservedCtv3Id=res.body.schemeId;
                res.body.status.should.be.eql("Reserved");
                done();
            });
    });

    it('should reserve a SNOMEDID (Single_SchemeId_test_08)', function(done){
        var reservationMetadata = {
            "expirationDate": "2019/09/30",
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/reserve?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                reservedSnomedId=res.body.schemeId;
                res.body.status.should.be.eql("Reserved");
                done();
            });
    });

    it('should release a CTV3ID (Single_SchemeId_test_09)', function(done){
        var releaseMetadata = {
            "schemeId": reservedCtv3Id,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/CTV3ID/release?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .expect('Content-Type', /json/)
            .send(releaseMetadata)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Available");
                done();
            });
    });

    it('should release a SNOMEDID (Single_SchemeId_test_10)', function(done){
        var releaseMetadata = {
            "schemeId": reservedSnomedId,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/SNOMEDID/release?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(releaseMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Available");
                done();
            });
    });

    it('should publish a generated CTV3ID (Single_SchemeId_test_11)', function(done){
        var publicationData = {
            "schemeId": firstCTV3ID,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/CTV3ID/publish?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Published");
                done();
            });
    });
    it('should publish a generated SNOMEDID (Single_SchemeId_test_12)', function(done){
        var publicationData = {
            "schemeId": firstSNOMEDID,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/SNOMEDID/publish?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationData)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Published");
                done();
            });
    });

    it('should fail to publish a reserved CTV3ID before registering it (Wrong Single_SchemeId_test_13)', function(done){
        var reservationMetadata = {
            "expirationDate": "2019/09/30",
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/reserve?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                reservedCtv3Id = res.body.schemeId;
                reservedSystemId=res.body.systemId;
                var publicationData = {
                    "schemeId": reservedCtv3Id,
                    "software": "Mocha Supertest",
                    "comment": "Testing REST API"
                };
                request(baseUrl)
                    .put('/scheme/CTV3ID/publish?token=' + token)
                    .set('Accept', 'application/json')
                    .set('Content-type', 'application/json')
                    .send(publicationData)
                    .expect(400,done)
            });
    });

    it('should fail to publish a reserved SNOMEDID before registering it (Wrong Single_SchemeId_test_14)', function(done){
        var reservationMetadata = {
            "expirationDate": "2019/09/30",
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/reserve?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                reservedSnomedId = res.body.schemeId;
                reservedSnomedSysId= res.body.systemId;
                var publicationData = {
                    "schemeId": reservedSnomedId,
                    "software": "Mocha Supertest",
                    "comment": "Testing REST API"
                };
                request(baseUrl)
                    .put('/scheme/SNOMEDID/publish?token=' + token)
                    .set('Accept', 'application/json')
                    .set('Content-type', 'application/json')
                    .send(publicationData)
                    .expect(400, done)
            });
    });

    it('should register a reserved CTV3Id with same systemId that was reserved', function(done){
        var registrationMetadata = {
            "schemeId": reservedCtv3Id,
            "systemId": reservedSystemId,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });
    it('should register a reserved SNOMEDID with same systemId that was reserved', function(done){
        var registrationMetadata = {
            "schemeId": reservedSnomedId,
            "systemId": reservedSnomedSysId,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect(200)
            .end(function(err, res) {
                //console.log(res);
                if (err) return done(err);
                res.body.schemeId.should.not.be.null();
                res.body.status.should.be.eql("Assigned");
                done();
            });
    });

    it('should fail to register a reserved CTV3ID with other existing systemId ', function(done){
        var registrationData = {
            "sctid": reservedCtv3Id,
            "systemId": ctv3Uuid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
            .expect(400,done)

    });


    it('should fail to register a reserved SNOMEDID with other existing systemId ', function(done){
        var registrationData = {
            "sctid": reservedSnomedId,
            "systemId": snomedIDUuid,
            "namespace": 0,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/register?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationData)
            .expect(400,done)

    });


    it('should retrieve a known CTV3Id by systemId (Single_SchemeId_test_15)', function(done){
        request(baseUrl)
            .get('/scheme/CTV3ID/systemids/' + ctv3Uuid + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.schemeId.should.not.be.null();
                res.body.schemeId.should.be.eql(firstCTV3ID);
                res.body.status.should.be.eql("Published");
                done();
            });
    });

    it('should retrieve a known SNOMEDID by systemId (Single_SchemeId_test_16)', function(done){
        request(baseUrl)
            .get('/scheme/SNOMEDID/systemids/' + snomedIDUuid + '?token=' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.schemeId.should.not.be.null();
                res.body.schemeId.should.be.eql(firstSNOMEDID);
                res.body.status.should.be.eql("Published");
                done();
            });
    });
});


describe('SchemeId  BULK', function() {

    it('Test bulk generate api for 2 brand new CTV3IDs (Bulk_SchemeIds_test_01)', function (done) {
        var generationMetadata = {
            "quantity": 10,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/bulk/generate/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationMetadata)
            .expect(200)
            .end(function (err, res) {
                //console.log(res);
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
                                res.body.length.should.be.eql(10);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                ctv3IdArray.push(res.body[0].schemeId);
                                ctv3IdArray.push(res.body[1].schemeId);
                                sysIds = res.body[0].systemId + "," + res.body[1].systemId;
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk generate api for 2 brand new SNOMEDIDs (Bulk_SchemeIds_test_02)', function (done) {
        var generationMetadata = {
            "quantity": 10,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/bulk/generate/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(generationMetadata)
            .expect('Content-Type', /json/)
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
                                res.body.length.should.be.eql(10);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                snomedIdArray.push(res.body[0].schemeId);
                                snomedIdArray.push(res.body[1].schemeId);
                                sysSnomedIds = res.body[0].systemId + "," + res.body[1].systemId;
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });
    it('Test bulk publish api for 2 assigned Ctv3Ids', function (done) {
        var publicationMetadata = {
            "schemeIds": ctv3IdArray,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/CTV3ID/bulk/publish/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.id.should.not.be.null();
                jobId=res.body.id;
                init=new Date().getTime();
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
                            .end(function(err, res) {
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Published");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk publish api for 2 assigned SnomedIds', function (done) {
        var publicationMetadata = {
            "schemeIds": snomedIdArray,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .put('/scheme/SNOMEDID/bulk/publish/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(publicationMetadata)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.not.be.null();
                res.body.id.should.not.be.null();
                jobId=res.body.id;
                init=new Date().getTime();
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
                            .end(function(err, res) {
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Published");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });
    it('Test bulk get Ctv3Ids by system ids ', function (done) {
        var ctv3Ids=ctv3IdArray[0] + "," + ctv3IdArray[1];
        request(baseUrl)
            .get('/scheme/CTV3ID/bulk/?token=' + token + '&schemeIds=' + ctv3Ids)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.length.should.be.eql(2);
                done();
            });

    });
    it('Test bulk get SnomedIds by system ids ', function (done) {
        var snomedIds=snomedIdArray[0] + "," + snomedIdArray[1];

        request(baseUrl)
            .get('/scheme/SNOMEDID/bulk/?token=' + token + '&schemeIds=' + snomedIds)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.length.should.be.eql(2);
                done();
            });

    });

    it('Test bulk register Ctv3Ids ', function (done) {
        var pair = getCtv3IdSystemIdPair(2);
        var registrationMetadata = {
            "records": pair,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk register SnomedIds ', function (done) {
        var pair = getSnomedIdSystemIdPair(2);
        var registrationMetadata = {
            "records": pair,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });
    it('Test bulk reserve CTV3IDs', function (done) {
        var reservationData = {
            "expirationDate": "2016-01-01",
            "quantity": 20,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/bulk/reserve/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationData)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(20);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Reserved");
                                retArray=[];
                                var obj1 = {
                                    "schemeId": res.body[0].schemeId,
                                    "systemId": res.body[0].systemId
                                };
                                retArray.push(obj1);
                                var obj2 = {
                                    "schemeId": res.body[1].schemeId,
                                    "systemId": res.body[1].systemId
                                };
                                retArray.push(obj2);
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();
                    }
                });
            });
    });

    it('Test bulk reserve SNOMEDIDs', function (done) {
        var reservationData = {
            "expirationDate": "2016-01-01",
            "quantity": 20,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/bulk/reserve/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(reservationData)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(20);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Reserved");
                                retSnomedIdArray=[];
                                var obj1 = {
                                    "schemeId": res.body[0].schemeId,
                                    "systemId": res.body[0].systemId
                                };
                                retSnomedIdArray.push(obj1);
                                var obj2 = {
                                    "schemeId": res.body[1].schemeId,
                                    "systemId": res.body[1].systemId
                                };
                                retSnomedIdArray.push(obj2);
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();
                    }
                });
            });
    });

    it('Test bulk register reserved Ctv3Ids ', function (done) {
        var registrationMetadata = {
            "records": retArray,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/CTV3ID/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");

                                if (res.body[0].schemeId == retArray[0].schemeId) {
                                    res.body[0].systemId.should.be.eql(retArray[0].systemId);
                                } else {
                                    res.body[0].systemId.should.be.eql(retArray[1].systemId);
                                }
                                if (res.body[1].schemeId == retArray[1].schemeId) {
                                    res.body[1].systemId.should.be.eql(retArray[1].systemId);
                                } else {
                                    res.body[1].systemId.should.be.eql(retArray[0].systemId);
                                }
                                done();
                            });
                    } else {
                        should.exist(job);
                        done();

                    }
                });

            });
    });

    it('Test bulk register reserved SNOMEDID ', function (done) {
        var registrationMetadata = {
            "records": retSnomedIdArray,
            "software": "Mocha Supertest",
            "comment": "Testing REST API"
        };
        request(baseUrl)
            .post('/scheme/SNOMEDID/bulk/register/?token=' + token)
            .set('Accept', 'application/json')
            .set('Content-type', 'application/json')
            .send(registrationMetadata)
            .expect('Content-Type', /json/)
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
                                //console.log(res);
                                if (err) return done(err);
                                objJob.status.should.be.eql("2");
                                res.body.length.should.be.eql(2);
                                res.body[0].jobId.should.be.eql(jobId);
                                res.body[0].status.should.be.eql("Assigned");

                                if (res.body[0].schemeId == retSnomedIdArray[0].schemeId) {
                                    res.body[0].systemId.should.be.eql(retSnomedIdArray[0].systemId);
                                } else {
                                    res.body[0].systemId.should.be.eql(retSnomedIdArray[1].systemId);
                                }
                                if (res.body[1].schemeId == retSnomedIdArray[1].schemeId) {
                                    res.body[1].systemId.should.be.eql(retSnomedIdArray[1].systemId);
                                } else {
                                    res.body[1].systemId.should.be.eql(retSnomedIdArray[0].systemId);
                                }
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