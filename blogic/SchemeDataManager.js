var dbInit=require("../config/dbInit");

module.exports.getSchemesForUser = function getSchemesForUser(username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsScheme.find({username: username}, function (err, permissions){
                if (err)
                    callback(err, null);
                else{
                    var schemes = [];
                    permissions.forEach(function(permission){
                        schemes.push({name: permission.scheme});
                    });
                    callback(null, schemes);
                }
            });
        }
    });
};

module.exports.getPermissions = function getPermissions(schemeId, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsScheme.find({scheme: schemeId}, function (err, permissions) {
                if (err)
                    callback(err, null);
                else
                    callback(null, permissions);
            });
        }
    });
};

module.exports.createPermission = function createPermission(permission, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsScheme.create(permission, function (err) {
                if (err)
                    callback(err);
                else
                    callback(null);
            });
        }
    });
};

module.exports.deletePermission = function deletePermission(schemeId, username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsScheme.find({scheme: schemeId, username: username}).remove(function(err) {
                if (err)
                    callback(err);
                else
                    callback(null);
            });
        }
    });
};