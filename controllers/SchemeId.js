/**
 * Created by ar on 7/16/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SchemeIdDataManager");
var scheme = require("./../blogic/SchemeDataManager");

function isAbleUser(schemeName, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (schemeName != "false"){
            scheme.getPermissions(schemeName, function(err, permissions) {
                if (err)
                    return next(err.message);
                else{
                    permissions.forEach(function(permission){
                        if (permission.username == user)
                            able = true;
                    });
                    return able;
                }
            });
        }else
            return able;
    }else
        return able;
}

module.exports.getSchemeId = function getSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeId = req.swagger.params.schemeId.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        if (isAbleUser(schemeName, data.user.name)){
            idDM.getSchemeId(schemeName, schemeId,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.getSchemeIds = function getSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var skip = req.swagger.params.skip.value;
    var limit = req.swagger.params.limit.value;
    var schemeName = req.swagger.params.scheme.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser("false", data.user.name)){
            var objQuery = false;
            if (schemeName)
                objQuery = {scheme: schemeName};
            idDM.getSchemeIds(objQuery, limit, skip, function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                }
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            idDM.getSchemeIdBySystemId(schemeName,systemId,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            generationMetadata.author=data.user.name;
            idDM.generateSchemeId(schemeName, generationMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            reservationMetadata.author=data.user.name;
            idDM.reserveSchemeId(schemeName, reservationMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            registrationMetadata.author=data.user.name;
            idDM.registerSchemeId(schemeName, registrationMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            deprecationMetadata.author=data.user.name;
            idDM.deprecateSchemeId(schemeName, deprecationMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            releaseMetadata.author=data.user.name;
            idDM.releaseSchemeId(schemeName, releaseMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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
        if (isAbleUser(schemeName, data.user.name)){
            publicationMetadata.author=data.user.name;
            idDM.publishSchemeId(schemeName, publicationMetadata,function(err,SchemeIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};