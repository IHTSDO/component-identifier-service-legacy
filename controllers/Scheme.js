/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

module.exports.getSchemes = function getSchemes (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
            {
                "name": "SNOMEDID"
            },
            {
                "name": "CTV3ID"
            }
        ]));
    });
};

module.exports.getScheme = function getScheme (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        var result = {};
        if (schemeName == "SNOMEDID") {
            result = {
                "name": "SNOMEDID",
                "description": "Generation of legacy SNOMED IDs, used in versions of SNOMED prior to SNOMED CT."
            }
        } else if (schemeName == "CTV3ID") {
            result = {
                "name": "CTV3ID",
                "description": "Generation of legacy CTV3 IDs, used in the Read Codes Terminology."
            }
        }
        res.end(JSON.stringify(result));
    });
};

module.exports.createNamespace = function createNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceData = req.swagger.params.namespace.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                "namespace": 10000171,
                "organizationName": "Uruguay NRC",
                "conceptsSequence": 1276351,
                "descriptionsSequence": 78271,
                "relationshipsSequence": 736287
            }
        ));
    });
};

module.exports.updateNamespace = function updateNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceData = req.swagger.params.namespace.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                "namespace": 10000171,
                "organizationName": "Uruguay NRC",
                "conceptsSequence": 1276351,
                "descriptionsSequence": 78271,
                "relationshipsSequence": 736287
            }
        ));
    });
};

module.exports.getPermissions = function getPermissions (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
                {
                    "scheme": schemeName,
                    "username": "alopez"
                },
                {
                    "scheme": schemeName,
                    "username": "greynoso"
                }
            ]
        ));
    });
};

module.exports.createPermission = function createPermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
                {
                    "scheme": schemeName,
                    "username": username
                }
        ));
    });
};

module.exports.deletePermission = function deletePermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({}));
    });
};