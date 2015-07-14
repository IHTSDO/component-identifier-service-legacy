/**
 * Created by alo on 7/13/15.
 */
'use strict';

module.exports.getNamespace = function getNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    console.log(token);
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
};

module.exports.getNamespaces = function getNamespaces (req, res, next) {
    var token = req.swagger.params.token.value;
    console.log(token);
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
};

module.exports.createNamespace = function createNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    console.log(token);
    var namespaceData = req.swagger.params.namespace.value;
    console.log(namespaceData);
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
};

module.exports.updateNamespace = function updateNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    console.log(token);
    var namespaceData = req.swagger.params.namespace.value;
    console.log(namespaceData);
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
};