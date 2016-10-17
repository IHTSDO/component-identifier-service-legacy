/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var namespace = require("../blogic/NamespaceDataManager");

function isAbleToEdit(namespaceId, user, callback){
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
                    var possibleGroups = [];
                    permissions.forEach(function(permission){
                        if (permission.role == "group"){
                            possibleGroups.push(permission.username);
                        }else if (permission.role == "manager" && permission.username == user)
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

module.exports.getNamespace = function getNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            namespace.getNamespace(namespaceId, function(err, namespaces) {
                if (err)
                    return next(err.message);
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(namespaces[0]));
                }
            });
        }
    });
};

module.exports.getNamespaces = function getNamespaces (req, res, next) {
    namespace.getNamespaces(function(err, namespaces) {
        if (err)
            return next(err.message);
        else{
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(namespaces));
        }
    });
};

module.exports.getNamespacesForUser = function getNamespacesForUser (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            namespace.getNamespacesForUser(username, function(err, namespaces) {
                if (err)
                    return next(err.message);
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(namespaces));
                }
            });
        }
    });
};

module.exports.createNamespace = function createNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceData = req.swagger.params.namespace.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            isAbleToEdit("false", data.user.name, function(able){
                if (able){
                    var namespaceString = namespaceData.namespace + '';
                    if (namespaceString.length != 7 && namespaceString != "0"){
                        return next("Invalid namespace");
                    }else{
                        namespace.createNamespace(namespaceData,function(err) {
                            if (err)
                                return next(err.message);
                            else{
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({message: "Success"}));
                            }
                        });
                    }
                }else
                    return next("No permission for the selected operation");
            });
        }
    });
};

module.exports.updateNamespace = function updateNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceData = req.swagger.params.namespace.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            isAbleToEdit(namespaceData.namespace, data.user.name, function(able){
                if(able){
                    namespace.editNamespace(namespaceData.namespace, namespaceData,function(err) {
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

module.exports.deleteNamespace = function deleteNamespace (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            isAbleToEdit(namespaceId, data.user.name, function(able){
                if(able){
                    namespace.deleteNamespace(namespaceId, function(err) {
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
    var namespaceId = req.swagger.params.namespaceId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            namespace.getPermissions(namespaceId, function(err, permissions) {
                if (err)
                    return next(err.message);
                else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(permissions));
                }
            });
        }
    });
};

module.exports.createPermission = function createPermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var username = req.swagger.params.username.value;
    var role = req.swagger.params.role.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            isAbleToEdit(namespaceId, data.user.name, function(able){
                if(able){
                    namespace.createPermission({namespace: namespaceId, username: username, role: role}, function(err) {
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

module.exports.deletePermission = function deletePermission (req, res, next) {
    var token = req.swagger.params.token.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }else{
            isAbleToEdit(namespaceId, data.user.name, function(able){
                if(able){
                    namespace.deletePermission(namespaceId, username, function(err) {
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

module.exports.updatePartitionSequence = function updatePartitionSequence (req, res, next) {
    var token = req.swagger.params.token.value;
    var partitionId = req.swagger.params.partitionId.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var value = req.swagger.params.value.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next({message: err.message, statusCode: 401});
        else{
            isAbleToEdit(namespaceId, data.user.name, function(able){
                if(able){
                    namespace.editPartition([namespaceId, partitionId], value,function(err) {
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