/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

module.exports.geSctids = function geSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctids = req.swagger.params.sctids.value;
    var sctidsArray = sctids.replace(/ /g,"").split(",");
    console.log("sctidsArray", sctidsArray);
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
                {
                    "sctid": parseInt(sctidsArray[0]),
                    "sequence": 557,
                    "namespace": 1000179,
                    "partitionId": 10,
                    "checkDigit": 7,
                    "systemId": "780ffeb2-aafa-4042-a643-228ec38afc80",
                    "status": "Assigned", // Assigned, Free, Reserved, Locked, Deprecated
                    "author": "alopez",
                    "software": "termSpace",
                    "expirationDate": "2015/08/29 18:02:32 UTC",
                    "comment": "Batch request for July release 2015"
                },
                {
                    "sctid": parseInt(sctidsArray[1]),
                    "sequence": 557,
                    "namespace": 1000179,
                    "partitionId": 10,
                    "checkDigit": 7,
                    "systemId": "780ffeb2-aafa-4042-a643-228ec38afc80",
                    "status": "Assigned", // Assigned, Free, Reserved, Locked, Deprecated
                    "author": "alopez",
                    "software": "termSpace",
                    "expirationDate": "2015/08/29 18:02:32 UTC",
                    "comment": "Batch request for July release 2015"
                }
            ]
        ));
    });
};

module.exports.processBulkSctidRequest = function processBulkSctidRequest (req, res, next) {
    var token = req.swagger.params.token.value;
    var operation = req.swagger.params.operation.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (operation.action in generator) {
            generator[operation.action](operation, function(err2, sctidRecords) {
                if (err2) {
                    return next(err2.message);
                }
                //
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctidRecords));
            });
        } else {
            return next("Unknown action: " + operation.action);
        }
    });
};

var sctidRecordMock = {
    "sctid": 0,
    "sequence": 557,
    "namespace": 1000179,
    "partitionId": 10,
    "checkDigit": 7,
    "systemId": "780ffeb2-aafa-4042-a643-228ec38afc80",
    "status": "assigned", // assigned, available, reserved, registered, deprecated, published
    "author": "alopez",
    "software": "termSpace",
    "expirationDate": "2015/08/29 18:02:32 UTC",
    "comment": "Batch request for July release 2015"
};

var generator = {};

generator.generate = function(operation, callback) {
    // TODO: Generates SCTID
    sctidRecordMock.status = "assigned";
    callback(null, [sctidRecordMock]);
};

generator.register = function(operation, callback) {
    // TODO: Registers SCTID
    sctidRecordMock.status = "registered";
    callback(null, [sctidRecordMock]);
};

generator.reserve = function(operation, callback) {
    // TODO: Reserves SCTID
    sctidRecordMock.status = "reserved";
    callback(null, [sctidRecordMock]);
};

generator.deprecate = function(operation, callback) {
    // TODO: Deprecates SCTID
    sctidRecordMock.status = "deprecated";
    callback(null, [sctidRecordMock]);
};

generator.release = function(operation, callback) {
    // TODO: Releases SCTID
    sctidRecordMock.status = "available";
    callback(null, [sctidRecordMock]);
};

generator.publish = function(operation, callback) {
    // TODO: Publishes SCTID
    sctidRecordMock.status = "published";
    callback(null, [sctidRecordMock]);
};

generator.getBySctid = function(operation, callback) {
    // TODO: Gets by SCTID
    sctidRecordMock.status = "published";
    callback(null, [sctidRecordMock]);
};

generator.getBySystemId = function(operation, callback) {
    // TODO: Gets by SystemId
    sctidRecordMock.status = "published";
    callback(null, [sctidRecordMock]);
};