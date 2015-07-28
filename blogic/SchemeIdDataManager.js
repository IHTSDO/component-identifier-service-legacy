/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var stateMachine=require("../model/StateMachine");
var db;
var model;
var fs = require('fs');
var path=require('path');
var schemes=[];
// Bootstrap models
var generators_path = __dirname + '/SchemeIdGenerator';
fs.readdirSync(generators_path).forEach(function (file) {
    if (~file.indexOf('.js')) {
        var schemeName=path.basename(file, '.js');
        schemes[schemeName.toUpperCase()]=require(generators_path + '/' + file)
    }
});

function getModel(callback){
    if (model){
        //console.log("Model from cache.");
        callback(null);
    }else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err);
            }else {

                db = pdb;
                model = podel1;
                //console.log("Model from dbinit.");
                callback(null);
            }
        })
    }
}

var throwErrMessage=function(msg){
    var err={};
    err.message=msg;
    return err;
};

var getSchemeId=function (scheme,schemeId, callback){
    if (schemeId==null || schemeId==""){
        callback(throwErrMessage("Not valid schemeId."),null);
        return;
    }
    var objQuery={scheme: scheme.toUpperCase(),schemeId: schemeId};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSchemeIdRecord(objQuery, function (err, schemeIdRecord) {
                if (err) {
                    callback(err, null);
                }
                if (!schemeIdRecord) {
                    getFreeRecord(scheme, schemeId,function(err,record){
                        if (err){
                            callback(err,null);
                        }else{
                            //console.log("getSchemeId record:" + JSON.stringify(record));
                            callback(null,record);
                        }
                    });
                }else {
                    callback(null, schemeIdRecord);
                }
            });
        }
    });
};

function getFreeRecord(scheme, schemeId, callback){
    var schemeIdRecord= getNewRecord(scheme, schemeId);
    schemeIdRecord.status= stateMachine.statuses.available;
    insertSchemeIdRecord(schemeIdRecord,function(err,newRecord){
        if (err){
            callback(err,null);
        }else{
            callback(null,newRecord);
        }

    });
}
function getNewRecord(scheme, schemeId){
    var schemeIdRecord= {
        scheme: scheme.toUpperCase(),
        schemeId: schemeId,
        sequence: schemes[scheme.toUpperCase()].getSequence( schemeId),
        checkDigit: schemes[scheme.toUpperCase()].getCheckDigit( schemeId),
        systemId:guid()
    };
    return schemeIdRecord;
}

var getSchemeIdBySystemId=function (scheme, systemId, callback){
    var objQuery={scheme: scheme.toUpperCase(), systemId:systemId};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSchemeIdRecord(objQuery, function (err, schemeIdRecord) {
                if (err) {
                    callback(err, null);
                }
                callback(null, schemeIdRecord);
            });
        }
    });
};

function getSchemeIdRecord(objQuery, callback){
    model.schemeId.find(objQuery, function (err, schemeIds) {
        if (err) {
            callback(err,null);
        }else {

            if (schemeIds.length > 0) {
                callback(null, schemeIds[0]);
            } else {
                callback(null, null);
            }
        }
    });
};


var generateSchemeId=function (scheme, operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            setNewSchemeIdRecord(scheme, operation, stateMachine.actions.generate, function (err, schemeIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    callback(null, schemeIdRecord);
                }
            });
        }
    });
};

var reserveSchemeId=function (scheme, operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        }else {
            setNewSchemeIdRecord(scheme, operation, stateMachine.actions.reserve, function (err, schemeIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    callback(null, schemeIdRecord);
                }
            });
        }
    });
};
var registerSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);
        }

        var newStatus=stateMachine.getNewStatus(schemeIdRecord.status,stateMachine.actions.register);
        if (newStatus) {

            schemeIdRecord.systemId = operation.systemId;
            schemeIdRecord.status = newStatus;
            schemeIdRecord.author = operation.author;
            schemeIdRecord.software = operation.software;
            schemeIdRecord.expirationDate = operation.expirationDate;
            schemeIdRecord.comment = operation.comment;
            updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                if (err) {
                    callback(err, null);
                }

                callback(null, updatedRecord);
            });
        }else{
            callback(throwErrMessage("Cannot register SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
        }

    });
};
var deprecateSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);
        }

        var newStatus=stateMachine.getNewStatus(schemeIdRecord.status,stateMachine.actions.deprecate);
        if (newStatus) {

            schemeIdRecord.status = newStatus;
            schemeIdRecord.software = operation.software;
            schemeIdRecord.comment = operation.comment;
            updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                if (err) {
                    callback(err, null);
                }

                callback(null, updatedRecord);
            });
        }else{
            callback(throwErrMessage("Cannot deprecate SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
        }

    });
};

var releaseSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);
        }

        var newStatus=stateMachine.getNewStatus(schemeIdRecord.status,stateMachine.actions.release);
        if (newStatus) {

            schemeIdRecord.status = newStatus;
            schemeIdRecord.software = operation.software;
            schemeIdRecord.comment = operation.comment;
            updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                if (err) {
                    callback(err, null);
                }

                callback(null, updatedRecord);
            });
        }else{
            callback(throwErrMessage("Cannot release SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
        }

    });
};

var publishSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord) {

        if (err) {
            callback(err, null);
        }

        var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, stateMachine.actions.publish);
        if (newStatus) {

            schemeIdRecord.status = newStatus;
            schemeIdRecord.software = operation.software;
            schemeIdRecord.comment = operation.comment;
            updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                if (err) {
                    callback(err, null);
                }

                callback(null, updatedRecord);
            });
        } else {
            callback(throwErrMessage("Cannot publish SchemeId:" + operation.schemeId + ", current status: " + schemeIdRecord.status), null);
        }
    });
};
function setNewSchemeIdRecord(scheme, operation,action,callback){

    getNextSchemeId(scheme, operation, function (err, newSchemeId) {
        if (err) {
            callback(err, null);
        }else {
            //console.log("newSchemeId:" + newSchemeId);
            getSchemeId(scheme, newSchemeId, function(err,schemeIdRecord){

                if (err) {
                    callback(err, null);
                }
                //console.log("schemeIdRecord2:" + JSON.stringify(schemeIdRecord));

                var newStatus=stateMachine.getNewStatus(schemeIdRecord.status,action);
                //console.log("newStatus:" + newStatus);
                if (newStatus) {
                    schemeIdRecord.systemId = operation.systemId;
                    schemeIdRecord.status = newStatus;
                    schemeIdRecord.author = operation.author;
                    schemeIdRecord.software = operation.software;
                    schemeIdRecord.expirationDate = operation.expirationDate;
                    schemeIdRecord.comment = operation.comment;

                    updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                        if (err) {
                            callback(err, null);
                        }

                        callback(null, updatedRecord);
                    });
                }else{
                    setNewSchemeIdRecord(scheme, operation,action,callback);
                }
            });
        }
    });
};

function getNextSchemeId(scheme, operation, callback){
    var key=scheme;
    model.schemeIdBase.get(key,function(err, schemaIdBaseRecord){

        var nextId=schemes[scheme.toUpperCase()].getNextId(schemaIdBaseRecord.idBase);
        schemaIdBaseRecord.idBase=nextId;

        schemaIdBaseRecord.save(function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,nextId);
            }
        })
    });
};

function updateSchemeIdRecord(schemeIdRecord, callback){
    var key=[schemeIdRecord.scheme, schemeIdRecord.schemeId];
    model.schemeId.get(key ,function(err, record){

        record.save(schemeIdRecord,function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,schemeIdRecord);
            }
        })
    });
}

function insertSchemeIdRecord(newSchemeIdRecord, callback){

    model.schemeId.create(newSchemeIdRecord, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, newSchemeIdRecord);
        }
    });
}

var removeSchemeId=function (query, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        } else {
            model.schemeId.find(query).remove(function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, null);
                }
            })
        }
    });
};


var initializeScheme=function (scheme,initialValue,callback) {
    getModel(function(err) {
        if (err) {
            callback(err, null);

        } else {
            model.schemeIdBase.find({scheme:scheme}).remove(function (err) {
                if (err) {
                    throw err;
                } else {
                    model.schemeIdBase.create({scheme: scheme, idBase: initialValue}, function (err) {
                        if (err) throw err;
                        callback();

                    });

                }
            });
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
module.exports.removeSchemeId=removeSchemeId;
module.exports.publishSchemeId=publishSchemeId;
module.exports.releaseSchemeId=releaseSchemeId;
module.exports.deprecateSchemeId=deprecateSchemeId;
module.exports.registerSchemeId=registerSchemeId;
module.exports.generateSchemeId=generateSchemeId;
module.exports.reserveSchemeId=reserveSchemeId;
module.exports.getSchemeIdBySystemId=getSchemeIdBySystemId;
module.exports.getSchemeId=getSchemeId;
module.exports.initializeScheme=initializeScheme;
