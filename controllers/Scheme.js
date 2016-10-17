/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var scheme = require("../blogic/SchemeDataManager");

function isAbleToEdit(schemeName, user, callback){
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
                        if (permission.username == user && permission.role == "manager")
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

module.exports.getSchemes = function getSchemes (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            scheme.getSchemes(function(err, schemes) {
                if (err)
                    return next(err.message);
                else{
                    //CTV3ID	XUsHS
                    //SNOMEDID	R-FF43C
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(schemes));
                }
            });
//            res.setHeader('Content-Type', 'application/json');
//            res.end(JSON.stringify([
//                {
//                    "name": "SNOMEDID"
//                },
//                {
//                    "name": "CTV3ID"
//                }
//            ]));
        }
    });
};

module.exports.getScheme = function getScheme (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            scheme.getScheme(schemeName, function(err, schemes) {
                if (err)
                    return next(err.message);
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(schemes[0]));
                }
            });
        }
//        res.setHeader('Content-Type', 'application/json');
//        var result = {};
//        if (schemeName == "SNOMEDID") {
//            result = {
//                "name": "SNOMEDID",
//                "description": "Generation of legacy SNOMED IDs, used in versions of SNOMED prior to SNOMED CT."
//            }
//        } else if (schemeName == "CTV3ID") {
//            result = {
//                "name": "CTV3ID",
//                "description": "Generation of legacy CTV3 IDs, used in the Read Codes Terminology."
//            }
//        }
//        res.end(JSON.stringify(result));
    });
};

module.exports.getSchemesForUser = function getSchemesForUser(req, res, next){
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            var groups = [username];
            security.getGroups(username, function(err, result) {
                if (!err && result && result.groups && result.groups.length) {
                    result.groups.forEach(function (group) {
                        groups.push(group.name);
                    });
                }
                scheme.getSchemesForUser(groups, function (err, schemes){
                    if (err) {
                        return next(err.message);
                    }else{
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(schemes));
                    }
                });
            });
        }
    });
};

module.exports.updateScheme = function updateScheme (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var schemeSeq = req.swagger.params.schemeSeq.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            isAbleToEdit(schemeName, data.user.name, function(able){
                if(able){
                    scheme.editScheme(schemeName, schemeSeq,function(err) {
                        if (err)
                            return next(err.message);
                        else{
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({message: "Success"}));
                        }
                    });
                }else
                    return next("No permission for the selected operation");
            });
        }
    });
};

module.exports.getPermissions = function getPermissions (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            scheme.getPermissions(schemeName, function(err, schemes){
                if (err)
                    return next(err.message);
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(schemes));
                }
            });
        }
    });
};

module.exports.createPermission = function createPermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var username = req.swagger.params.username.value;
    var role = req.swagger.params.role.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            isAbleToEdit(schemeName, data.user.name, function(able){
                if(able){
                    scheme.createPermission({scheme: schemeName, username: username, role: role}, function(err){
                        if (err)
                            return next(err.message);
                        else{
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({message: "success"}));
                        }
                    });
                }else
                    return next("No permission for the selected operation");
            });
        }
    });
};

module.exports.deletePermission = function deletePermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            isAbleToEdit(schemeName, data.user.name, function(able){
                if(able){
                    scheme.deletePermission(schemeName, username, function(err){
                        if (err)
                            return next(err.message);
                        else{
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({message: "success"}));
                        }
                    });
                }else
                    return next("No permission for the selected operation");
            });
        }
    });
};