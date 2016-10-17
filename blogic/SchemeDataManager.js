var dbInit=require("../config/dbInit");

module.exports.getSchemes = function getSchemes(callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.schemeIdBase.all(function (err, schemeResult) {
                if (err)
                    callback(err, null);
                else
                    callback(null, schemeResult);
            });
        }
    });
};

module.exports.getScheme = function getScheme(id, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.schemeIdBase.find({scheme: id},function (err, schemeResult) {
                if (err)
                    callback(err, null);
                else{
                    if (schemeResult[0])
                        callback(null, schemeResult);
                    else
                        callback(null, []);
                }
            });
        }
    });
};

module.exports.getSchemesForUser = function getSchemesForUser(username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            console.log(username);
            model.permissionsScheme.find({username: username}, function (err, permissions){
                if (err)
                    callback(err, null);
                else{
                    var schemes = [];
                    permissions.forEach(function(permission){
                        schemes.push({scheme: permission.scheme});
                    });
                    callback(null, schemes);
                }
            });
        }
    });
};

module.exports.editScheme = function editScheme(id, schemeSeq, callback) {
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.schemeIdBase.get(id, function(err, scheme) {
                if (err)
                    callback(err);
                else{
                    scheme.idBase = schemeSeq;
                    scheme.save(function(err){
                        if (err)
                            callback(err);
                        else
                            callback(null);
                    });
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