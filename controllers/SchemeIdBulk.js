/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

module.exports.getSchemeIds = function getSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var schemeIds = req.swagger.params.schemeIds.value;
    var schemeIdsArray = sctids.replace(/ /g,"").split(",");
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
                {
                    "scheme": schemeName,
                    "schemeId": schemeIdsArray[0],
                    "sequence": 557,
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

module.exports.processBulkSchemeIdRequest = function processBulkSchemeIdRequest (req, res, next) {
    var token = req.swagger.params.token.value;
    var operation = req.swagger.params.operation.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (operation.action in generator[schemeName]) {
            operation.scheme = schemeName;
            schemeIdRecordMock.scheme = schemeName;
            generator[schemeName][operation.action](operation, function(err2, schemeIdRecords) {
                if (err2) {
                    return next(err2.message);
                }
                //
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(schemeIdRecords));
            });
        } else {
            return next("Unknown action: " + operation.action);
        }
    });
};

var schemeIdRecordMock = {
    "scheme": "",
    "schemeId": "0",
    "sequence": 557,
    "checkDigit": 7,
    "systemId": "780ffeb2-aafa-4042-a643-228ec38afc80",
    "status": "assigned", // assigned, available, reserved, registered, deprecated, published
    "author": "alopez",
    "software": "termSpace",
    "expirationDate": "2015/08/29 18:02:32 UTC",
    "comment": "Batch request for July release 2015"
};

var generator = {};
generator["SNOMEDID"] = {};
generator["CTV3ID"] = {};

generator["SNOMEDID"].generate = function(operation, callback) {
    // TODO: Generates SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "assigned";
    callback(null, [schemeIdRecordMock]);
};

generator["SNOMEDID"].register = function(operation, callback) {
    // TODO: Registers SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "registered";
    callback(null, [schemeIdRecordMock]);
};

generator["SNOMEDID"].reserve = function(operation, callback) {
    // TODO: Reserves SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "reserved";
    callback(null, [schemeIdRecordMock]);
};

generator["SNOMEDID"].deprecate = function(operation, callback) {
    // TODO: Deprecates SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "deprecated";
    callback(null, [schemeIdRecordMock]);
};

generator["SNOMEDID"].release = function(operation, callback) {
    // TODO: Releases SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "available";
    callback(null, [schemeIdRecordMock]);
};

generator["SNOMEDID"].publish = function(operation, callback) {
    // TODO: Publishes SNOMEDID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "published";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].generate = function(operation, callback) {
    // TODO: Generates CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "assigned";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].register = function(operation, callback) {
    // TODO: Registers CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "registered";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].reserve = function(operation, callback) {
    // TODO: Reserves CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "reserved";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].deprecate = function(operation, callback) {
    // TODO: Deprecates CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "deprecated";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].release = function(operation, callback) {
    // TODO: Releases CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "available";
    callback(null, [schemeIdRecordMock]);
};

generator["CTV3ID"].publish = function(operation, callback) {
    // TODO: Publishes CTV3ID
    schemeIdRecordMock.schemeId = operation.sctid;
    schemeIdRecordMock.status = "published";
    callback(null, [schemeIdRecordMock]);
};