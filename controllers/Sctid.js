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

function isAbleUser(namespaceId, user, callback){
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
                    if (!able) {
                        security.getGroups(user,function(err, result) {
                            if (err) {
                                console.log("Error accessing groups", err);
                                callback(able);
                            } else {
                                result.groups.forEach(function(loopGroup){
                                    if (loopGroup.name == "namespace-" + namespaceId)
                                        able = true;
                                });
                                callback(able);
                            }
                        });
                    } else {
                        callback(able);
                    }
                }
            });
        }else
            callback(able);
    }else
        callback(able);
}

function isSchemeAbleUser(schemeName, user, callback){
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
                    callback(able);
                }
            });
        }else
            callback(able);
    }else
        callback(able);
}

module.exports.checkSctid = function getSctids (req, res, next) {
    var sctid = req.swagger.params.sctid.value;
    idDM.checkSctid(sctid, function(err,sctIdDetails){
        if (err) {
            return next(err.message);
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sctIdDetails));
        }
    });
};


module.exports.getSctids = function getSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespace = req.swagger.params.namespace.value;
    var skip = req.swagger.params.skip.value;
    var limit = req.swagger.params.limit.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser("false", data.user.name, function(able){
            if (able){
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
    });
};

module.exports.getSctid = function getSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctid = req.swagger.params.sctid.value;
    var includeAdditionalIds = req.swagger.params.includeAdditionalIds.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        var namespace = sctIdHelper.getNamespace(sctid);
        if (namespace){
            isAbleUser(namespace, data.user.name, function(able){
                if (able){
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
            });
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
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(namespaceId, data.user.name, function(able){
            if (able){
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
    });
};

module.exports.generateSctid = function generateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var generationData = req.swagger.params.generationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(generationData.namespace, data.user.name, function(able){
            if (able){
                if ((generationData.namespace==0 && generationData.partitionId.substr(0,1)!="0")
                    || (generationData.namespace!=0 && generationData.partitionId.substr(0,1)!="1")){
                    return next("Namespace and partitionId parameters are not consistent.");
                }
                if (!generationData.systemId || generationData.systemId.trim()==""){
                    generationData.systemId=guid();
                    generationData.autoSysId=true;
                }
                generationData.author=data.user.name;
                idDM.generateSctid(generationData,function(err,sctIdRecord){
                    if (err) {

                        return next(err.message);
                    }
                    var sctIdRecordArray = [];
                    if (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE" &&
                        generationData.partitionId.substr(1,1)=="0"){
                        isSchemeAbleUser("CTV3ID", data.user.name, function(able){
                            if (able){
                                schemeIdDM.generateSchemeId("CTV3ID", generationData, function (err, ctv3IdRecord) {
                                    if (err) {
                                        return next(err.message);
                                    }

                                    sctIdRecordArray.push(ctv3IdRecord);
                                    isSchemeAbleUser("SNOMEDID", data.user.name, function(able){

                                        if (able){

                                            schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                                                if (err) {

                                                    return next(err.message);
                                                }

                                                sctIdRecordArray.push(snomedIdRecord);

                                                sctIdRecord.additionalIds = sctIdRecordArray;
                                                console.log("[" + new Date() + "] End single method called: generateSctid, params: " + JSON.stringify(generationData) );
                                                res.setHeader('Content-Type', 'application/json');
                                                res.end(JSON.stringify(sctIdRecord));
                                            });
                                        }else{
                                            sctIdRecord.additionalIds = sctIdRecordArray;
                                            console.log("[" + new Date() + "] End single method called: generateSctid, params: " + JSON.stringify(generationData) );
                                            res.setHeader('Content-Type', 'application/json');
                                            res.end(JSON.stringify(sctIdRecord));
                                        }
                                    });
                                });
                            }else{
                                isSchemeAbleUser("SNOMEDID", data.user.name, function(able){
                                    if (able){
                                        schemeIdDM.generateSchemeId("SNOMEDID", generationData, function (err, snomedIdRecord) {
                                            if (err) {

                                                return next(err.message);
                                            }

                                            sctIdRecordArray.push(snomedIdRecord);

                                            sctIdRecord.additionalIds = sctIdRecordArray;
                                            console.log("[" + new Date() + "] End single method called: generateSctid, params: " + JSON.stringify(generationData) );
                                            res.setHeader('Content-Type', 'application/json');
                                            res.end(JSON.stringify(sctIdRecord));
                                        });
                                    }else{
                                        console.log("[" + new Date() + "] End single method called: generateSctid, params: " + JSON.stringify(generationData) );
                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(JSON.stringify(sctIdRecord));
                                    }
                                });
                            }
                        });
                    }else {
                        sctIdRecord.additionalIds=sctIdRecordArray;
                        console.log("[" + new Date() + "] End single method called: generateSctid, params: " + JSON.stringify(generationData) );
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(sctIdRecord));
                    }
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.reserveSctid = function reserveSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var reservationData = req.swagger.params.reservationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(reservationData.namespace, data.user.name, function(able){
            if (able){
                if ((reservationData.namespace==0 && reservationData.partitionId.substr(0,1)!="0")
                    || (reservationData.namespace!=0 && reservationData.partitionId.substr(0,1)!="1")){
                    return next("Namespace and partitionId parameters are not consistent.");
                }
                reservationData.author=data.user.name;
                idDM.reserveSctid(reservationData,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: reserveSctid, params: " + JSON.stringify(reservationData) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.registerSctid = function registerSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var registrationData = req.swagger.params.registrationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        var namespace = sctIdHelper.getNamespace(registrationData.sctid);
        if (namespace!=registrationData.namespace){
            return next("Namespaces differences between sctId and parameter");
        }
        isAbleUser(namespace, data.user.name, function(able){
            if (able){
                if (!registrationData.systemId || registrationData.systemId==""){
                    registrationData.autoSysId=true;
                }
                registrationData.author=data.user.name;
                idDM.registerSctid(registrationData,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: registerSctid, params: " + JSON.stringify(registrationData) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.deprecateSctid = function deprecateSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var deprecationData = req.swagger.params.deprecationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        var namespace = sctIdHelper.getNamespace(deprecationData.sctid);

        if (namespace!=deprecationData.namespace){
            return next("Namespaces differences between sctId and parameter");
        }
        isAbleUser(namespace, data.user.name, function(able){
            if (able){
                deprecationData.author=data.user.name;
                idDM.deprecateSctid(deprecationData,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: deprecateSctid, params: " + JSON.stringify(deprecationData) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.releaseSctid = function releaseSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var releaseData = req.swagger.params.releaseData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        var namespace = sctIdHelper.getNamespace(releaseData.sctid);

        if (namespace!=releaseData.namespace){
            return next("Namespaces differences between sctId and parameter");
        }
        isAbleUser(namespace, data.user.name, function(able){
            if (able){
                releaseData.author=data.user.name;
                idDM.releaseSctid(releaseData,function(err,sctIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: releaseSctid, params: " + JSON.stringify(releaseData) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.publishSctid = function publishSctid (req, res, next) {
    var token = req.swagger.params.token.value;
    var publicationData = req.swagger.params.publicationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        var namespace = sctIdHelper.getNamespace(publicationData.sctid);

        isAbleUser(namespace, data.user.name, function(able){
            if (able){
                publicationData.author=data.user.name;
                idDM.publishSctid(publicationData,function(err,sctIdRecord){
                    if (err) {
                        return next({message:err.message, statusCode: 400});
                    }
                    console.log("[" + new Date() + "] End single method called: publishSctid, params: " + JSON.stringify(publicationData) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
        if (namespace!=publicationData.namespace){
            return next("Namespaces differences between sctId and parameter");
        }
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