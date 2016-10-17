/**
 * Created by ar on 7/16/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM = require("./../blogic/SchemeIdDataManager");
var scheme = require("./../blogic/SchemeDataManager");

function isAbleUser(schemeName, user, callback){
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
                    var possibleGroups = [];
                    permissions.forEach(function(permission){
                        if (permission.role == "group"){
                            possibleGroups.push(permission.username);
                        }else if (permission.username == user)
                            able = true;
                    });
                    if (!able && possibleGroups.length) {
                        security.getGroups(user,function(err, result) {
                            if (err) {
                                console.log("Error accessing groups", err);
                                callback(able);
                            } else {
                                result.groups.forEach(function(loopGroup){
                                    if (possibleGroups.indexOf(loopGroup.name) != -1)
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

module.exports.getSchemeId = function getSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeId = req.swagger.params.schemeId.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
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
    });
};

module.exports.getSchemeIds = function getSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var skip = req.swagger.params.skip.value;
    var limit = req.swagger.params.limit.value;
    var schemeName = req.swagger.params.scheme.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser("false", data.user.name, function(able){
            if (able){
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
    });
};

module.exports.getSchemeIdBySystemId = function getSchemeIdBySystemId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var systemId = req.swagger.params.systemId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
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
    });
};

module.exports.generateSchemeId = function generateSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var generationMetadata = req.swagger.params.generationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                if (!generationMetadata.systemId || generationMetadata.systemId.trim()==""){
                    generationMetadata.systemId=guid();
                    generationMetadata.autoSysId=true;
                }
                generationMetadata.author=data.user.name;
                idDM.generateSchemeId(schemeName, generationMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: generateSchemeId, params: " + JSON.stringify(generationMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.reserveSchemeId = function reserveSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var reservationMetadata = req.swagger.params.reservationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                reservationMetadata.author=data.user.name;
                idDM.reserveSchemeId(schemeName, reservationMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: reserveSchemeId, params: " + JSON.stringify(reservationMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.registerSchemeId = function registerSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var registrationMetadata = req.swagger.params.registrationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                registrationMetadata.author=data.user.name;
                if (!registrationMetadata.systemId || registrationMetadata.systemId==""){
                    registrationMetadata.autoSysId=true;
                }
                idDM.registerSchemeId(schemeName, registrationMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: registerSchemeId, params: " + JSON.stringify(registrationMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.deprecateSchemeId = function deprecateSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var deprecationMetadata = req.swagger.params.deprecationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                deprecationMetadata.author=data.user.name;
                idDM.deprecateSchemeId(schemeName, deprecationMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: deprecateSchemeId, params: " + JSON.stringify(deprecationMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.releaseSchemeId = function releaseSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var releaseMetadata = req.swagger.params.releaseMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                releaseMetadata.author=data.user.name;
                idDM.releaseSchemeId(schemeName, releaseMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: releaseSchemeId, params: " + JSON.stringify(releaseMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
        });
    });
};

module.exports.publishSchemeId = function publishSchemeId (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var publicationMetadata = req.swagger.params.publicationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(schemeName, data.user.name, function(able){
            if (able){
                publicationMetadata.author=data.user.name;
                idDM.publishSchemeId(schemeName, publicationMetadata,function(err,SchemeIdRecord){
                    if (err) {
                        return next(err.message);
                    }
                    console.log("[" + new Date() + "] End single method called: publishSchemeId, params: " + JSON.stringify(publicationMetadata) );
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(SchemeIdRecord));
                });
            }else
                return next("No permission for the selected operation");
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