/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var stateMachine=require("../model/StateMachine");
var sctIdHelper=require("../utils/SctIdHelper");
var db={};
var model;
var sets=require('simplesets');
var Sync = require('sync');
var idDM = require("./../blogic/SCTIdDataManager");
var partition;
function getModel(callback) {
    if (model) {
        //console.log("Model from cache.");
        callback(null);
    } else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err);
            } else {

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

var getSctids=function (sctidArray, callback){

    sctidArray.forEach(function(sctid){

        if (!sctIdHelper.validSCTId(sctid)) {
            callback(throwErrMessage("Not valid SCTID: " + sctid), null);
            return;
        }
    });
    var objQuery={sctid: sctidArray};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSCTIDRecords(objQuery, function (err, sctIdRecords) {
                if (err) {
                    callback(err, null);
                    return;
                }
                var resArray=[];
                //if (sctIdRecords ){
                sctIdRecords.forEach(function(sctIdRecord){
                    resArray.push(sctIdRecord.sctid);
                });
                var rA=new sets.StringSet(resArray);
                var rQ=new sets.StringSet(sctidArray);
                var diff=rQ.difference(rA).array();

                if (diff && diff.length>0){
                    var cont=0;
                    diff.forEach(function(rec){

                        getFreeRecord(sctid, null,function (err, record) {
                            if (err) {
                                callback(err, null);
                            } else {
                                cont++;
                                sctIdRecords.push(record);
                                //console.log("getSctId record:" + JSON.stringify(record));
                                if (cont==diff.length) {
                                    callback(null, record);
                                    return;
                                }
                            }
                        });
                    });
                }else {
                    callback(null, sctIdRecords);
                }
            });
        }
    });
};

function getFreeRecord(sctid, systemId, callback){
    Sync(function() {
        var sctIdRecord = getNewRecord(sctid, systemId);
        sctIdRecord.status = stateMachine.statuses.available;
        var newRecord = insertSCTIDRecord.sync(null, sctIdRecord);

        callback(null, newRecord);
    });
}
function getNewRecord(sctid, systemId){
    var sctIdRecord= {
        sctid: sctid,
        sequence: sctIdHelper.getSequence(sctid),
        namespace: sctIdHelper.getNamespace(sctid),
        partitionId: sctIdHelper.getPartition(sctid),
        checkDigit: sctIdHelper.getCheckDigit(sctid)
    };
    if (systemId) {
        sctIdRecord.systemId = systemId;
    }else{
        sctIdRecord.systemId = guid();
    }
    return sctIdRecord;
}

var getSctidBySystemIds=function (namespaceId,systemIds, callback){
    var objQuery={namespace: namespaceId, systemId:systemIds};
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getSCTIDRecords(objQuery, function (err, sctIdRecords) {
                if (err) {
                    callback(err, null);
                }
                callback(null, sctIdRecords);
            });
        }
    });
};

function getSCTIDRecords(objQuery, callback){
    model.sctId.find(objQuery, function (err, sctids) {
        if (err) {
            callback(err,null);
        }else {
            callback(null, sctids);
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
var registerSctids=function (operation, callback){
    var cont=0;
    var records=[];
    for (var i=0;i<operation.records.length;i++) {
        sctid = operation.records[i].sctid;
        systemId = operation.records[i].systemId;

        getSctid(sctid, systemId, function (err, sctIdRecord) {

            if (err) {
                callback(err);

            } else {

                var newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.register);
                if (newStatus) {

                    sctIdRecord.status = newStatus;
                    sctIdRecord.author = operation.author;
                    sctIdRecord.software = operation.software;
                    sctIdRecord.expirationDate = operation.expirationDate;
                    sctIdRecord.comment = operation.comment;
                    sctIdRecord.jobId = operation.jobId;

                    records.push(sctIdRecord);
                    cont++;
                    if (cont == operation.records.length) {
                        cont = 0;
                        for (var j = 0; j < records.length; j++) {

                            records[j].save(function (err) {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                cont++;
                                if (cont == records.length) {
                                    callback(null);
                                    return;

                                }

                            });
                        }
                    }
                } else {
                    callback(throwErrMessage("Cannot register SCTID:" + sctid + ", current status: " + sctIdRecord.status));
                    return;
                }
            }

        });
    }

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


var getSctid=function (sctid, systemId, callback) {
    Sync(function () {
        if (!sctIdHelper.validSCTId(sctid)) {
            process.nextTick("Not valid SCTID.");
            return;
        }
        var objQuery = {sctid: sctid};
        getModel.sync(null);
        var sctIdRecord = getSCTIDRecord.sync(null, objQuery);
        if (!sctIdRecord) {
            var record = getFreeRecord.sync(null, sctid, systemId);
            callback(null, record);
        } else {
            callback(null, sctIdRecord);
        }
    });
};


function updateSCTIDRecord(sctidRecord, callback){
    Sync(function() {
        var sctIdRecord = model.sctId.get.sync(null, sctidRecord.sctid);

        var updatedSctidRecord = sctIdRecord.save.sync(null, sctidRecord);
        callback(null, updatedSctidRecord);
    });
}

function insertSCTIDRecord(newSctidRecord, callback){
    Sync(function() {
        var newSctidRecord2 = model.sctId.create.sync(null, newSctidRecord);
        callback(null, newSctidRecord2);
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


function generateSctid(operation, thisPartition, callback){
    Sync(function() {
        getModel.sync(null);

        var sctIdRecord = setNewSCTIdRecord.sync(null, operation, thisPartition, stateMachine.actions.generate);

        callback(null, sctIdRecord);
    });
};

function setNewSCTIdRecord(operation,thisPartition,action,callback) {
    Sync(function () {
        try {

            thisPartition.sequence = thisPartition.sequence + 1;
            var seq = thisPartition.sequence;
            var newSCTId = computeSCTID(operation, seq);
            var systemId ;
            if (operation.systemId && operation.systemId.trim() != "") {
                systemId = operation.systemId;
            }
            var sctIdRecord = getSctid.sync(null, newSCTId,systemId);


            var newStatus = stateMachine.getNewStatus(sctIdRecord.status, action);
            if (newStatus) {

                sctIdRecord.status = newStatus;
                sctIdRecord.author = operation.author;
                sctIdRecord.software = operation.software;
                sctIdRecord.expirationDate = operation.expirationDate;
                sctIdRecord.comment = operation.comment;
                sctIdRecord.jobId=operation.jobId;
                var updatedRecord = sctIdRecord.save.sync(null);
                callback(null, updatedRecord);
            } else {
                var otherSctIdRecord = setNewSCTIdRecord.sync(null, operation, thisPartition, action);
                callback(null, otherSctIdRecord);
            }
        } catch (e) {
            console.error("error:" + JSON.stringify(e)); // something went wrong
        }
    });
};

function getNextNumber( thisPartition, callback) {
    var nextNumber;
    thisPartition.sequence = thisPartition.sequence + 1;
    nextNumber = thisPartition.sequence;

    callback(null, nextNumber);
};

function getPartition(key,callback){
        model.partitions.get(key,function(err,partitions) {
            if (err){
                callback(err,null);
            }else {
                //partition=partitions;
                callback(null, partitions);
            }
        });
};
function getSCTIDRecord(objQuery, callback){
    Sync(function() {
        var sctids = model.sctId.find.sync(null, objQuery);
        if (sctids.length > 0) {
            callback(null, sctids[0]);
        } else {
            callback(null, null);
        }
    });
};

var generateSctids=function (operation, callback) {
    getModel(function (err) {
        if (err) {
            callback(err);
        } else {
            //var sctIdRecords = [];
            var cont = 0;
            var key=[parseInt(operation.namespace),operation.partitionId.toString()];
            //console.log("key:" + JSON.stringify(key));

            getPartition(key,function(err,data) {
                if (err){
                    callback(err);
                }else {
                    var thisPartition=data;
                    console.log("getting partition :" + JSON.stringify(thisPartition) + " for key:" + JSON.stringify(key));
                    for (var i = 0; i < operation.quantity; i++) {

                        Sync(function () {
                            operation.systemId = operation.systemIds[i];
                            generateSctid.sync(null, operation, thisPartition);
                            //sctIdRecords.push(sctIdRecord);
                            cont++;
                            if (operation.quantity == cont) {
                                thisPartition.save(function (err) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        console.log("saving partition :" + JSON.stringify(thisPartition) + " for key:" + JSON.stringify(key));
                                        callback(null);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
};
module.exports.generateSctids=generateSctids;
module.exports.registerSctids=registerSctids;
module.exports.getSctidBySystemIds=getSctidBySystemIds;
module.exports.getSctids=getSctids;
//module.exports.sctIdUpdate=sctIdUpdate;