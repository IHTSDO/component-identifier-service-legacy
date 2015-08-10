/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SCTIdDataManager");
var namespace = require("./../blogic/NamespaceDataManager");
var schemeIdDM = require("./../blogic/SchemeIdDataManager");
var sctIdHelper = require("./../utils/SctIdHelper");
var schemeDM = require("./../blogic/SchemeDataManager");

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

function isSchemeAbleUser(schemeName, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (schemeName != "false"){
            schemeDM.getPermissions(schemeName, function(err, permissions) {
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


module.exports.getSctids = function getSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespace = req.swagger.params.namespace.value;
    var skip = req.swagger.params.skip.value;
    var limit = req.swagger.params.limit.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser("false", data.user.name)){
            var objQuery = false;
            if (namespace)
                objQuery = {namespace: namespace};
            idDM.getSctids(objQuery, limit, skip, function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                }
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.getSctid = function getSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctid = req.swagger.params.sctid.value;
    var includeAdditionalIds = req.swagger.params.includeAdditionalIds.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        var namespace = sctIdHelper.getNamespace(sctid);
        if (namespace){
            if (isAbleUser(namespace, data.user.name)){
                idDM.getSctid(sctid,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    if (includeAdditionalIds && includeAdditionalIds == "true") {
                        schemeIdDM.getSchemeIds({"systemId": sctIdRecord.systemId },10,0,function(err, schemeIdRecords){
                            if (err) {
                                return next(err.message);
                            }
                            sctIdRecord.additionalIds = schemeIdRecords;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(sctIdRecord));
                        });
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(sctIdRecord));
                    }
                });
            }else
                return next("No permission for the selected operation");
        }else{
            idDM.getSctid(sctid,function(err,sctIdRecord){
                if (err) {
                    return next(err.message);
                }
                if (includeAdditionalIds && includeAdditionalIds == "true") {
                    schemeIdDM.getSchemeIds({"systemId": sctIdRecord.systemId },10,0,function(err, schemeIdRecords){
                        if (err) {
                            return next(err.message);
                        }
                        sctIdRecord.additionalIds = schemeIdRecords;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(sctIdRecord));
                    });
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                }
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
            console.log("Abled user");
            if ((generationData.namespace==0 && generationData.partitionId.substr(0,1)!="0")
                || (generationData.namespace!=0 && generationData.partitionId.substr(0,1)!="1")){
                return next("Namespace and partitionId parameters are not consistent.");
            }
            if (!generationData.systemId || generationData.systemId.trim()==""){
                generationData.systemId=guid();
            }
            generationData.author=data.user.name;
            idDM.generateSctid(generationData,function(err,sctIdRecord){
                if (err) {

                    return next(err.message);
                }
                var sctIdRecordArray = [];
                if (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE" &&
                    generationData.partitionId.substr(1,1)=="0"){

                    if (!isSchemeAbleUser("CTV3ID", data.user.name)) {

                        if (isSchemeAbleUser("SNOMEDID", data.user.name)) {

                            schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                                if (err) {

                                    return next(err.message);
                                }

                                sctIdRecordArray.push(snomedIdRecord);

                                sctIdRecord.additionalIds = sctIdRecordArray;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(sctIdRecord));
                            });
                        }else {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(sctIdRecord));
                        }
                    }else {
                        schemeIdDM.generateSchemeId("CTV3ID", generationData, function (err, ctv3IdRecord) {
                            if (err) {

                                return next(err.message);
                            }

                            sctIdRecordArray.push(ctv3IdRecord);
                            if (!isSchemeAbleUser("SNOMEDID", data.user.name)) {
                                sctIdRecord.additionalIds = sctIdRecordArray;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(sctIdRecord));
                            }else {
                                schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                                    if (err) {

                                        return next(err.message);
                                    }

                                    sctIdRecordArray.push(snomedIdRecord);

                                    sctIdRecord.additionalIds = sctIdRecordArray;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify(sctIdRecord));
                                });
                            }
                        });
                    }
                }else {
                    sctIdRecord.additionalIds=sctIdRecordArray;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
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

            if ((reservationData.namespace==0 && reservationData.partitionId.substr(0,1)!="0")
                || (reservationData.namespace!=0 && reservationData.partitionId.substr(0,1)!="1")){
                return next("Namespace and partitionId parameters are not consistent.");
            }
            reservationData.author=data.user.name;
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
        var namespace = sctIdHelper.getNamespace(registrationData.sctid);
        if (namespace!=registrationData.namespace){
            return next("Namespaces differences between sctid and parameter");
        }
        if (isAbleUser(namespace, data.user.name)){
            registrationData.author=data.user.name;
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
        var namespace = sctIdHelper.getNamespace(deprecationData.sctid);

        if (namespace!=deprecationData.namespace){
            return next("Namespaces differences between sctid and parameter");
        }
        if (isAbleUser(namespace, data.user.name)){
            deprecationData.author=data.user.name;
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
        var namespace = sctIdHelper.getNamespace(releaseData.sctid);

        if (namespace!=releaseData.namespace){
            return next("Namespaces differences between sctid and parameter");
        }
        if (isAbleUser(namespace, data.user.name)){
            releaseData.author=data.user.name;
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
        var namespace = sctIdHelper.getNamespace(publicationData.sctid);

        if (namespace!=publicationData.namespace){
            return next("Namespaces differences between sctid and parameter");
        }
        if (isAbleUser(namespace, data.user.name)){
            publicationData.author=data.user.name;
            idDM.publishSctid(publicationData,function(err,sctIdRecord){
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