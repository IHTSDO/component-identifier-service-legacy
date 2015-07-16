/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

module.exports.getNamespace = function getNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                "namespace": parseInt(namespaceId),
                "organizationName": "Uruguay NRC",
                "conceptsSequence": 1276351,
                "descriptionsSequence": 78271,
                "relationshipsSequence": 736287
            }
        ));
    });
};

module.exports.getNamespaces = function getNamespaces (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
            {
                "namespace": 10000171,
                "organizationName": "Uruguay NRC",
                "conceptsSequence": 1276351,
                "descriptionsSequence": 78271,
                "relationshipsSequence": 736287
            },
            {
                "namespace": 10000041,
                "organizationName": "Norway NRC",
                "conceptsSequence": 1232,
                "descriptionsSequence": 432,
                "relationshipsSequence": 3222
            }
        ]));
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
    var namespaceId = req.swagger.params.namespaceId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
                {
                    "namespace": parseInt(namespaceId),
                    "username": "alopez"
                },
                {
                    "namespace": parseInt(namespaceId),
                    "username": "greynoso"
                }
            ]
        ));
    });
};

module.exports.createPermission = function createPermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
                {
                    "namespace": parseInt(namespaceId),
                    "username": username
                }
        ));
    });
};

module.exports.deletePermission = function deletePermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({}));
    });
};

module.exports.updatePartitionSequence = function updatePartitionSequence (req, res, next) {
    var token = req.swagger.params.token.value;
    var partitionId = req.swagger.params.partitionId.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var value = req.swagger.params.value.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(
            {
                "namespace": parseInt(namespaceId),
                "organizationName": "Uruguay NRC",
                "conceptsSequence": parseInt(value),
                "descriptionsSequence": partitionId,
                "relationshipsSequence": parseInt(value)
            }
        ));
    });
};