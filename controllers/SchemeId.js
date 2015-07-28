/**
 * Created by ar on 7/16/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SchemeIdDataManager");

module.exports.getSchemeId = function getSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeId = req.swagger.params.schemeId.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        idDM.getSchemeId(schemeName, schemeId,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });
    });
};

module.exports.getSchemeIdBySystemId = function getSchemeIdBySystemId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var systemId = req.swagger.params.systemId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        idDM.getSchemeIdBySystemId(schemeName,systemId,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.generateSchemeId = function generateSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var generationMetadata = req.swagger.params.generationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.generateSchemeId(schemeName, generationMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.reserveSchemeId = function reserveSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var reservationMetadata = req.swagger.params.reservationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.reserveSchemeId(schemeName, reservationMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.registerSchemeId = function registerSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var registrationMetadata = req.swagger.params.registrationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.registerSchemeId(schemeName, registrationMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.deprecateSchemeId = function deprecateSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var deprecationMetadata = req.swagger.params.deprecationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.deprecateSchemeId(schemeName, deprecationMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.releaseSchemeId = function releaseSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var releaseMetadata = req.swagger.params.releaseMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.releaseSchemeId(schemeName, releaseMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};

module.exports.publishSchemeId = function publishSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var publicationMetadata = req.swagger.params.publicationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.publishSchemeId(schemeName, publicationMetadata,function(err,SchemeIdRecord){
            if (err) {
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(SchemeIdRecord));
        });

    });
};