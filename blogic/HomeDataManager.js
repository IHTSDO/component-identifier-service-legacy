/**
 * Created by tom on 7/30/15.
 */

var dbInit=require("../config/dbInit");
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
                                namespaceResult.forEach(function(namespaceR){
                                    model.sctId.count({namespace: namespaceR.namespace}, function (err, namespaceCount){
                                        if (err)
                                            callback(err, null);
                                        else{
                                            done++;
                                            result.namespaces[namespaceR.namespace] = namespaceCount;
                                            if (total == done){
                                                callback(null, result);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }else{
                model.permissionsScheme.count({username: username}, function (err, schemesCount) {
                    if (err)
                        callback(err, null);
                    else{
                        result.schemes = schemesCount;
                        model.permissionsNamespace.find({username: username}, function (err, namespaceResult) {
                            if (err)
                                callback(err, null);
                            else{
                                result.namespaces.total = namespaceResult.length;
                                var total = namespaceResult.length, done = 0;
                                namespaceResult.forEach(function(namespaceR){
                                    model.sctId.count({namespace: namespaceR.namespace}, function (err, namespaceCount){
                                        if (err)
                                            callback(err, null);
                                        else{
                                            done++;
                                            result.namespaces[namespaceR.namespace] = namespaceCount;
                                            if (total == done){
                                                callback(null, result);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};