/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var stateMachine=require("../model/StateMachine");
var sctIdHelper=require("../utils/SctIdHelper");
var db;
var model;
//var Sync = require('sync');

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

var getSctids = function (query, limit, skip, callback){
    var objQuery={};
    var limitR = 100;
    var skipTo = 0;
    if (limit)
        limitR = limit;
    if (skip)
        skipTo = skip;
    if (query)
        objQuery = query;
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            model.sctId.find(objQuery).limit(parseInt(limitR)).offset(parseInt(skipTo)).run( function (err, sctids) {
                if (err) {
                    callback(err,null);
                }else {
                    callback(null, sctids);
                }
            });
        }
    });
};

var getSctid=function (sctid, callback){
    if (!sctIdHelper.validSCTId(sctid)){
        callback(throwErrMessage("Not valid SCTID."),null);
        return;
    }
    var objQuery={sctid: sctid};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSCTIDRecord(objQuery, function (err, sctIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    if (!sctIdRecord) {
                        getFreeRecord(sctid, function (err, record) {
                            if (err) {
                                callback(err, null);
                            } else {
                                //console.log("getSctId record:" + JSON.stringify(record));
                                callback(null, record);
                            }
                        });
                    } else {
                        callback(null, sctIdRecord);
                    }
                }
            });
        }
    });
};

function getFreeRecord(sctid, callback){
    var sctIdRecord= getNewRecord(sctid);
    sctIdRecord.status= stateMachine.statuses.available;
    insertSCTIDRecord(sctIdRecord,function(err,newRecord){
        if (err){
            callback(err,null);
        }else{
            callback(null,newRecord);
        }

    });
}
function getNewRecord(sctid){
    var sctIdRecord= {
        sctid: sctid,
        sequence: sctIdHelper.getSequence(sctid),
        namespace: sctIdHelper.getNamespace(sctid),
        partitionId: sctIdHelper.getPartition(sctid),
        checkDigit: sctIdHelper.getCheckDigit(sctid),
        systemId:guid()
};
    return sctIdRecord;
}

var getSctidBySystemId=function (namespaceId,systemId, callback){
    var objQuery={namespace: namespaceId, systemId:systemId};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSCTIDRecord(objQuery, function (err, sctIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    callback(null, sctIdRecord);
                }
            });
        }
    });
};

function getSCTIDRecord(objQuery, callback){
    model.sctId.find(objQuery, function (err, sctids) {
        if (err) {
            callback(err,null);
        }else {

            if (sctids.length > 0) {
                callback(null, sctids[0]);
            } else {
                callback(null, null);
            }
        }
    });
};


var generateSctid=function (operation, callback) {
    getModel(function (err) {
        if (err) {
            callback(err, null);
        } else {
            if (!operation.autoSysId) {
                getSctidBySystemId(operation.namespace, operation.systemId ,function(err,sctid){
                    if (err){
                        callback(err,null);
                    }else if (sctid){

                        callback(null,sctid);
                    }else{
                        setNewSCTIdRecord(operation, stateMachine.actions.generate, function (err, sctIdRecord) {

                            if (err) {
                                callback(err, null);
                            } else {

                                callback(null, sctIdRecord);
                            }
                        });

                    }
                });
            } else {
                setNewSCTIdRecord(operation, stateMachine.actions.generate, function (err, sctIdRecord) {

                    if (err) {
                        callback(err, null);
                    } else {

                        callback(null, sctIdRecord);
                    }
                });
            }
        }
    });
};

var reserveSctid=function (operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        }else {
            setNewSCTIdRecord(operation, stateMachine.actions.reserve, function (err, sctIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    callback(null, sctIdRecord);
                }
            });
        }
    });
};
var registerSctid=function (operation, callback) {

    if (!operation.autoSysId) {
        getSctidBySystemId(operation.namespace, operation.systemId, function (err, sctid) {
            if (err) {
                callback(err, null);
            } else if (sctid) {
                if (sctid != operation.sctid) {
                    callback(throwErrMessage("SystemId:" + operation.systemId + " already exists with SctId:" + sctid), null);
                    return;
                }
                callback(null, sctid);
            } else {
                registerNewSctId(operation, function (err, newSctId) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, newSctId);
                    }
                });
            }
        });
    } else {
        registerNewSctId(operation, function (err, newSctId) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, newSctId);
            }
        });

    }
};

function registerNewSctId(operation, callback){
    getSctid(operation.sctid,function(err,sctIdRecord){

        if (err) {
            callback(err, null);

        }else {

            var newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.register);
            if (newStatus) {
                if (operation.systemId && operation.systemId.trim() != "") {
                    sctIdRecord.systemId = operation.systemId;
                }
                sctIdRecord.status = newStatus;
                sctIdRecord.author = operation.author;
                sctIdRecord.software = operation.software;
                sctIdRecord.expirationDate = operation.expirationDate;
                sctIdRecord.comment = operation.comment;
                updateSCTIDRecord(sctIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot register SCTID:" + operation.sctid + ", current status: " + sctIdRecord.status), null);
            }
        }

    });
};

var deprecateSctid=function (operation, callback){
    getSctid(operation.sctid,function(err,sctIdRecord){

        if (err) {
            callback(err, null);

        }else {

            var newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.deprecate);
            if (newStatus) {

                sctIdRecord.status = newStatus;
                sctIdRecord.author = operation.author;
                sctIdRecord.software = operation.software;
                sctIdRecord.comment = operation.comment;
                updateSCTIDRecord(sctIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot deprecate SCTID:" + operation.sctid + ", current status: " + sctIdRecord.status), null);
            }
        }
    });
};

var releaseSctid=function (operation, callback){
    getSctid(operation.sctid,function(err,sctIdRecord){

        if (err) {
            callback(err, null);

        }else {

            var newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.release);
            if (newStatus) {

                sctIdRecord.status = newStatus;
                sctIdRecord.author = operation.author;
                sctIdRecord.software = operation.software;
                sctIdRecord.comment = operation.comment;
                updateSCTIDRecord(sctIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot release SCTID:" + operation.sctid + ", current status: " + sctIdRecord.status), null);
            }
        }
    });
};

var publishSctid=function (operation, callback){
    getSctid(operation.sctid,function(err,sctIdRecord) {

        if (err) {
            callback(err, null);

        }else {

            var newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.publish);
            if (newStatus) {

                sctIdRecord.status = newStatus;
                sctIdRecord.author = operation.author;
                sctIdRecord.software = operation.software;
                sctIdRecord.comment = operation.comment;
                updateSCTIDRecord(sctIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot publish SCTID:" + operation.sctid + ", current status: " + sctIdRecord.status), null);
            }
        }
    });
};
function setNewSCTIdRecord(operation,action,callback) {
    getNextNumber( operation, function (err, seq) {
        if (err) {
            callback(err, null);
        } else {

            var newSCTId = computeSCTID(operation, seq);
            //console.log("newSCTId:" + newSCTId);
            getSctid(newSCTId, function (err, sctIdRecord) {

                if (err) {
                    callback(err, null);

                } else {
                    //console.log("sctIdRecord2:" + JSON.stringify(sctIdRecord));

                    var newStatus = stateMachine.getNewStatus(sctIdRecord.status, action);
                    //console.log("newStatus:" + newStatus);
                    if (newStatus) {

                        if (operation.systemId && operation.systemId.trim() != "") {
                            sctIdRecord.systemId = operation.systemId;
                        }
                        sctIdRecord.status = newStatus;
                        sctIdRecord.author = operation.author;
                        sctIdRecord.software = operation.software;
                        sctIdRecord.expirationDate = operation.expirationDate;
                        sctIdRecord.comment = operation.comment;

                        updateSCTIDRecord(sctIdRecord, function (err, updatedRecord) {

                            if (err) {
                                callback(err, null);
                            } else {

                                callback(null, updatedRecord);
                            }
                        });
                    } else {
                        setNewSCTIdRecord(operation, action, callback);
                    }
                }
            });
        }
    });
};

function getNextNumber( operation, callback){

    var key=[parseInt(operation.namespace),operation.partitionId.toString()];
    model.partitions.get(key,function(err, partition){

        if (err){
            callback(throwErrMessage("error getting partition:" + operation.partitionId.toString() + " for namespace:" + operation.namespace + ", err: " + JSON.stringify(err)),null);
            return;
        }
        partition.sequence++;

        var nextNumber=partition.sequence;
        partition.save(function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,nextNumber);
            }
        })
    });
};

function updateSCTIDRecord(sctidRecord, callback){
    model.sctId.get(sctidRecord.sctid ,function(err, sctIdRecord){

        sctIdRecord.save(sctidRecord,function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,sctidRecord);
            }
        })
    });
}

function insertSCTIDRecord(newSctidRecord, callback){

    model.sctId.create(newSctidRecord, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, newSctidRecord);
        }
    });
}


function computeSCTID(operation,seq){

    var tmpNsp=operation.namespace.toString();
    if (tmpNsp=="0"){
        tmpNsp="";
    }
    var base = seq + tmpNsp + operation.partitionId;
    var SCTId = base + sctIdHelper.verhoeffCompute(base);
    return SCTId;

}

var removeSctId=function (query, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        } else {
            model.sctId.find(query).remove(function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, null);
                }
            })
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
module.exports.removeSctId=removeSctId;
module.exports.publishSctid=publishSctid;
module.exports.releaseSctid=releaseSctid;
module.exports.deprecateSctid=deprecateSctid;
module.exports.registerSctid=registerSctid;
module.exports.generateSctid=generateSctid;
module.exports.reserveSctid=reserveSctid;
module.exports.getSctidBySystemId=getSctidBySystemId;
module.exports.getSctid=getSctid;
module.exports.getSctids=getSctids;
