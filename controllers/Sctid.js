/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SCTIdDataManager");
var namespace = require("./../blogic/NamespaceDataManager");
var schemeIdDM = require("./../blogic/SchemeIdDataManager");
var sctIdHelper = require("./../utils/SctIdHelper");

function isAbleUser(namespaceId, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (namespaceId != "false"){
            namespace.getPermissions(namespaceId, function(err, permissions) {
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

module.exports.getSctid = function getSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctid = req.swagger.params.sctid.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        //getNamespace(sctid)
        var namespace = sctIdHelper.getNamespace(sctid);
        if (namespace){
            if (isAbleUser(namespace, data.user.name)){
                res.setHeader('Content-Type', 'application/json');
                idDM.getSctid(sctid,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        }else{
            res.setHeader('Content-Type', 'application/json');
            idDM.getSctid(sctid,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }
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
        res.setHeader('Content-Type', 'application/json');
        if (isAbleUser(namespaceId, data.user.name)){
            idDM.getSctidBySystemId(namespaceId,systemId,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.generateSctid = function generateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var generationData = req.swagger.params.generationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(generationData.namespace, data.user.name)){
            if (!generationData.systemId || generationData.systemId.trim()==""){
                generationData.systemId=guid();
            }
            idDM.generateSctid(generationData,function(err,sctIdRecord){
                if (err) {

                    return next(err.message);
                }
                var sctIdRecordArray = [];
                if (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE"){
                    schemeIdDM.generateSchemeId("CTV3ID",generationData,function(err,ctv3IdRecord) {
                        if (err) {

                            return next(err.message);
                        }
                        schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                            if (err) {

                                return next(err.message);
                            }
                            sctIdRecordArray.push(sctIdRecord);
                            sctIdRecordArray.push(ctv3IdRecord);
                            sctIdRecordArray.push(snomedIdRecord);

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(sctIdRecordArray));
                        });
                    });
                }else {
                    sctIdRecordArray.push(sctIdRecord);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecordArray));
                }
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.reserveSctid = function reserveSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var reservationData = req.swagger.params.reservationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(reservationData.namespace, data.user.name)){
            idDM.reserveSctid(reservationData,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.registerSctid = function registerSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var registrationData = req.swagger.params.registrationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(registrationData.namespace, data.user.name)){
            idDM.registerSctid(registrationData,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.deprecateSctid = function deprecateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var deprecationData = req.swagger.params.deprecationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(deprecationData.namespace, data.user.name)){
            idDM.deprecateSctid(deprecationData,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.releaseSctid = function releaseSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var releaseData = req.swagger.params.releaseData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(releaseData.namespace, data.user.name)){
            idDM.releaseSctid(releaseData,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.publishSctid = function publishSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var publicationData = req.swagger.params.publicationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(publicationData.namespace, data.user.name)){
            idDM.publishSctid(publicationData,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                res.end(JSON.stringify(sctIdRecord));
            });
        }else
            return next("No permission for the selected operation");
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