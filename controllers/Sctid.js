/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SCTIdDataManager");
var schemeIdDM = require("./../blogic/SchemeIdDataManager");

module.exports.getSctid = function getSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctid = req.swagger.params.sctid.value;
    console.log("step0-getid");
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        idDM.getSctid(sctid,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });
    });
};

module.exports.getSctidBySystemId = function getSctidBySystemId (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var systemId = req.swagger.params.systemId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        idDM.getSctidBySystemId(namespaceId,systemId,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};

module.exports.generateSctid = function generateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var generationData = req.swagger.params.generationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (!generationData.systemId || generationData.systemId.trim()==""){
            generationData.systemId=guid();
        }
        idDM.generateSctid(generationData,function(err,sctIdRecord){
            if (err) {

                return next(err.message);
            }
            if (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE"){
                schemeIdDM.generateSchemeId("CTV3ID",generationData,function(err,ctv3IdRecord) {
                    if (err) {

                        return next(err.message);
                    }
                    schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                        if (err) {

                            return next(err.message);
                        }
                        var sctIdRecordArray = [];
                        sctIdRecordArray.push(sctIdRecord);
                        sctIdRecordArray.push(ctv3IdRecord);
                        sctIdRecordArray.push(snomedIdRecord);

                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(sctIdRecordArray));
                    });
                });
            }else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            }
        });

    });
};

module.exports.reserveSctid = function reserveSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var reservationData = req.swagger.params.reservationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.reserveSctid(reservationData,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};

module.exports.registerSctid = function registerSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var registrationData = req.swagger.params.registrationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.registerSctid(registrationData,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};

module.exports.deprecateSctid = function deprecateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var deprecationData = req.swagger.params.deprecationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.deprecateSctid(deprecationData,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};

module.exports.releaseSctid = function releaseSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var releaseData = req.swagger.params.releaseData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.releaseSctid(releaseData,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};

module.exports.publishSctid = function publishSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var publicationData = req.swagger.params.publicationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.publishSctid(publicationData,function(err,sctIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdRecord));
        });

    });
};
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