var dbInit=require("../config/dbInit");
var db={};
var model;

function getModel(callback){
    if (model){
       console.log("Model from cache.");
        callback(null,model);
    }else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err,null);
            }else {

                db = pdb;
                model = podel1;
               console.log("Model from dbinit.");
                callback(null,model);
            }
        })
    }
}

module.exports.getNamespaces = function getNamespaces(callback){
    getModel(function(err,model2){
        if (err)
            throw err;
        else{
            console.log(model2);
            model2.namespace.find({namespace:"2222222"},function (err, namespaceResult) {
                if (err)
                    callback(err, null);
                else
                    callback(null, namespaceResult);
            });
        }
    });
}

module.exports.createNamespace = function createNamespace(objNamespace, callback){
    //Todo verify obj
    getModel(function(err){
        if (err)
            throw err;
        else{
            model.namespace.create(objNamespace, function (err) {
                if (err)
                    callback(err);
                else
                    callback(null);
            });
        }
    });
};

module.exports.deleteNamespace = function deleteNamespace(id, callback){
    //Todo verify obj
    getModel(function(err){
        if (err)
            throw err;
        else{
            model.namespace.get([id],function(err,namespaces) {
                if (namespaces){
                    console.log("removing namespace:" + namespaces.namespace);
                    namespaces.remove(function(err){
                        if (err) throw err;
                    })
                }
            });
        }
    });
};
