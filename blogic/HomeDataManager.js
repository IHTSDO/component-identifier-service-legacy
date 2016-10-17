/**
 * Created by tom on 7/30/15.
 */

var dbInit=require("../config/dbInit");
var sctid=require("../model/sctid");
var security = require("./../blogic/Security");

module.exports.getStats = function getStats(username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            var result = {
                namespaces:{},
                schemes: 2,
                users: 0
            }, adminU = false, users = [];
            var added = function (userToAdd){
                var found = false;
                users.forEach(function(userAdded){
                    if (userAdded == userToAdd)
                        found = true;
                });
                return found;
            };
            security.admins.forEach(function(admin){
                if (admin == username)
                    adminU = true;
                if (!added(admin))
                    users.push(admin);
            });
            security.users.forEach(function(user){
                if (!added(user))
                    users.push(user);
            });
            result.users = users.length;
            if (adminU){
                model.schemeIdBase.count({}, function (err, schemesCount) {
                    if (err)
                        callback(err, null);
                    else{
                        result.schemes = schemesCount;
                        model.namespace.find({}, function (err, namespaceResult) {
                            if (err)
                                callback(err, null);
                            else{
                                result.namespaces.total = namespaceResult.length;
                                var total = namespaceResult.length, done = 0;
                                if (total > 0){
                                    namespaceResult.forEach(function(namespaceR){
                                        sctid.count({namespace: namespaceR.namespace}, function (err, namespaceCount){
                                            if (err)
                                                callback(err, null);
                                            else{
                                                done++;
                                                result.namespaces[namespaceR.organizationName + " (" + namespaceR.namespace + ")"] = namespaceCount;
                                                if (total == done){
                                                    callback(null, result);
                                                }
                                            }
                                        });
                                    });
                                }else
                                    callback(null, result);
                            }
                        });
                    }
                });
            }else{
                var otherGroups = [username], namespacesFromGroup = [];
                security.getGroups(username, function(err, resultG) {
                    if (!err && resultG && resultG.length) {
                        resultG.forEach(function(loopGroup){
                            if (loopGroup.substr(0, loopGroup.indexOf("-")) == "namespace")
                                namespacesFromGroup.push(loopGroup.substr(loopGroup.indexOf("-") + 1));
                            else otherGroups.push(loopGroup);
                        });
                    }
                    model.permissionsScheme.count({username: otherGroups}, function (err, schemesCount) {
                        if (err)
                            callback(err, null);
                        else{
                            result.schemes = schemesCount;
                            model.permissionsNamespace.find({username: otherGroups}, function (err, namespaceResult) {
                                if (err)
                                    callback(err, null);
                                else{
                                    if (namespacesFromGroup.length){
                                        namespacesFromGroup.forEach(function (namespLoop) {
                                            var found = false;
                                            namespaceResult.forEach(function(namesp){
                                                if (namesp.namespace == namespLoop)
                                                     found = true;
                                            });
                                            if (!found)
                                                namespaceResult.push({namespace: namespLoop});
                                        });
                                    }
                                    result.namespaces.total = namespaceResult.length;
                                    var total = namespaceResult.length, done = 0;
                                    if (total > 0){
                                        namespaceResult.forEach(function(namespaceR){
                                            sctid.count({namespace: namespaceR.namespace}, function (err, namespaceCount){
                                                if (err)
                                                    callback(err, null);
                                                else{
                                                    done++;
                                                    var name = namespaceR.namespace;
                                                    if (namespaceR.organizationName)
                                                        name = namespaceR.organizationName + " (" + namespaceR.namespace + ")";
                                                    result.namespaces[name] = namespaceCount;
                                                    if (total == done){
                                                        callback(null, result);
                                                    }
                                                }
                                            });
                                        });
                                    }else
                                        callback(null, result);
                                }
                            });
                        }
                    });
                });
            }
        }
    });
};