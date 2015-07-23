var dbInit=require("../config/dbInit");

module.exports.getNamespaces = function getNamespaces(callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.namespace.all(function (err, namespaceResult) {
                if (err)
                    callback(err, null);
                else
                    callback(null, namespaceResult);
            });
        }
    });
};

module.exports.getNamespacesForUser = function getNamespacesForUser(username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsNamespace.find({username: username}, function (err, permissions){
                if (err)
                    callback(err, null);
                else{
                    var namespaces = [];
                    permissions.forEach(function(permission){
                        namespaces.push(permission.namespace);
                    });
                    model.namespace.find({namespace: namespaces}, function (err, namespaceResult) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, namespaceResult);
                    });
                }
            });
        }
    });
};

module.exports.getNamespace = function getNamespace(id, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.namespace.find({namespace: id},function (err, namespaceResult) {
                if (err)
                    callback(err, null);
                else{
                    model.partitions.find({namespace: id},function (err, partitionsResult) {
                        if (err)
                            callback(err, null);
                        else{
                            if (namespaceResult[0]){
                                namespaceResult[0].partitions = partitionsResult;
                                callback(null, namespaceResult);
                            }else
                                callback(null, []);
                        }
                    });
                }
            });
        }
    });
};

module.exports.createNamespace = function createNamespace(objNamespace, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            var partitionsOfObj = objNamespace.partitions;
            model.namespace.create(objNamespace, function (err) {
                if (err)
                    callback(err);
                else{
                    var partitions = [];
                    if (partitionsOfObj && partitionsOfObj.length)
                        partitions = partitionsOfObj;
                    else{
                        partitions = [{
                            namespace: objNamespace.namespace,
                            partitionId: "10",
                            sequence: 0
                        },{
                            namespace: objNamespace.namespace,
                            partitionId: "11",
                            sequence: 0
                        },{
                            namespace: objNamespace.namespace,
                            partitionId: "12",
                            sequence: 0
                        }];
                    }
                    model.partitions.create(partitions, function (err) {
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

module.exports.editPartition = function editPartition(ids, editedSequence, callback) {
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.partitions.get(ids, function(err, partition) {
                if (err)
                    callback(err);
                else{
                    partition.sequence = editedSequence;
                    partition.save(function(err){
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

module.exports.editNamespace = function editNamespace(id, editedNamespace, callback) {
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.namespace.get(id, function(err, namespace) {
                if (err)
                    callback(err);
                else{
                    namespace.organizationName =editedNamespace.organizationName;
                    namespace.email =editedNamespace.email;
                    namespace.save(function(err){
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

module.exports.deleteNamespace = function deleteNamespace(id, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.namespace.find({namespace: id}).remove(function(err) {
                if (err)
                    callback(err);
                else{
                    model.partitions.find({namespace: id}).remove(function(err) {
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

module.exports.getPermissions = function getPermissions(namespaceId, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsNamespace.find({namespace: namespaceId}, function (err, permissions) {
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
            model.permissionsNamespace.create(permission, function (err) {
                if (err)
                    callback(err);
                else
                      callback(null);
            });
        }
    });
};

module.exports.deletePermission = function deletePermission(namespaceId, username, callback){
    dbInit.getDB(function (err, pdb, model) {
        if (err)
            throw err;
        else{
            model.permissionsNamespace.find({namespace: namespaceId, username: username}).remove(function(err) {
                if (err)
                    callback(err);
                else
                    callback(null);
            });
        }
    });
};