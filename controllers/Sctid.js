/**
 * Created by alo on 7/13/15.
 */
'use strict';

module.exports.geSctid = function geSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctid = req.swagger.params.sctid.value;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
        {
            "sctid":  parseInt(sctid),
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
    ));
};