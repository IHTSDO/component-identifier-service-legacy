/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var stateMachine=require("../model/StateMachine");
var sctIdHelper=require("../utils/SctIdHelper");
var model;
var sctid=require("../model/sctid");
var sets=require('simplesets');
var Sync = require('sync');

function getModel(callback) {
    if (model) {
        callback(null);
    } else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err);
            } else {

                model = podel1;
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

var getSctids=function (sctidArray, callback) {

    sctidArray.forEach(function (sctId) {

        if (!sctIdHelper.validSCTId(sctId)) {
            callback(throwErrMessage("Not valid SCTID: " + sctId), null);
            return;
        }
    });
    var objQuery = {sctid: sctidArray};
    sctid.findByIds(objQuery, function (err, sctIdRecords) {
        if (err) {
            callback(err, null);
            return;
        }
        var resArray = [];
        sctIdRecords.forEach(function (sctIdRecord) {
            resArray.push(sctIdRecord.sctid);
        });
        var rA = new sets.StringSet(resArray);
        var rQ = new sets.StringSet(sctidArray);
        var diff = rQ.difference(rA).array();

        if (diff && diff.length > 0) {
            var cont = 0;
            diff.forEach(function (sctId) {

                getFreeRecord(sctId, null, function (err, record) {
                    if (err) {
                        callback(err, null);
                    } else {
                        cont++;
                        sctIdRecords.push(record);
                        //console.log("getSctId record:" + JSON.stringify(record));
                        if (cont == diff.length) {
                            callback(null, sctIdRecords);
                            return;
                        }
                    }
                });
            });
        } else {
            callback(null, sctIdRecords);
        }
    });
};

function getFreeRecord(sctId, systemId, callback){
    Sync(function() {
        try {
            var sctIdRecord = getNewRecord(sctId, systemId);
            sctIdRecord.status = stateMachine.statuses.available;
            var newRecord = insertSCTIDRecord.sync(null, sctIdRecord);

            callback(null, newRecord);
        }catch (e){
            callback(e,null);
        }
    });
}

function getNewRecord(sctId, systemId){
    var sctIdRecord= {
        sctid: sctId,
        sequence: sctIdHelper.getSequence(sctId),
        namespace: sctIdHelper.getNamespace(sctId),
        partitionId: sctIdHelper.getPartition(sctId),
        checkDigit: sctIdHelper.getCheckDigit(sctId)
    };
    if (systemId) {
        sctIdRecord.systemId = systemId;
    }else{
        sctIdRecord.systemId = guid();
    }
    return sctIdRecord;
}

var getSctidBySystemIds=function (namespaceId,systemIds, callback) {
    var objQuery = {namespace: namespaceId, systemId: systemIds};
    sctid.findBySystemIds(objQuery, function (err, sctIdRecords) {
        if (err) {
            callback(err, null);
        }
        callback(null, sctIdRecords);
    });
};

var getSyncSctidBySystemId=function (namespaceId,systemId, callback) {
    Sync(function () {
        var objQuery = {namespace: namespaceId, systemId: systemId};
        try {
            var sctIdRecord = sctid.findBySystemId.sync(null, objQuery);
            if (!sctIdRecord || sctIdRecord.length==0) {
                callback(null, null);
            } else {
                callback(null, sctIdRecord[0]);
            }
        } catch (e) {
            callback(e, null);
        }
    });
};

var registerSctids=function (operation, callback) {
    Sync(function () {
        try {
            var cont = 0;
            var records = [];
            var error = false;
            for (var i = 0; i < operation.records.length; i++) {
                var sctId = operation.records[i].sctid;
                var systemId = operation.records[i].systemId;
                if (error) {
                    break;
                }
                var sctIdRecord = getSctid.sync(null, sctId, systemId);
                if (error) {
                    return;
                }
                    if (sctIdRecord.sctid == sctId && sctIdRecord.systemId != systemId) {
                        sctIdRecord.systemId=systemId;
                    }
                    var newStatus;
                    if (sctIdRecord.status==stateMachine.statuses.assigned){
                        newStatus=stateMachine.statuses.assigned;
                    }else {
                        newStatus = stateMachine.getNewStatus(sctIdRecord.status, stateMachine.actions.register);
                    }
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

                                sctid.save(records[j], function (err) {
                                    if (err) {
                                        error = true;
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
                        error = true;
                        callback("Cannot register SCTID:" + sctIdRecord.sctid + ", current status: " + sctIdRecord.status);
                        return;
                    }
            }
        }catch(e){
            callback(e.message);
        }
    });
};

var updateSctids=function (operation, callback){
    var cont=0;
    var records=[];
    var error=false;
    for (var i=0;i<operation.sctids.length;i++) {
        var sctId = operation.sctids[i];
        if (error) {
            break;
        }
        getSctid(sctId, null, function (err, sctIdRecord) {
            if (error) {
                return;
            }
            if (err) {
                error = true;
                callback(err);
                return;
            } else {


                var newStatus = stateMachine.getNewStatus(sctIdRecord.status,operation.action);
                if (newStatus) {

                    sctIdRecord.status = newStatus;
                    sctIdRecord.author = operation.author;
                    sctIdRecord.software = operation.software;
                    sctIdRecord.comment = operation.comment;
                    sctIdRecord.jobId = operation.jobId;
                    records.push(sctIdRecord);
                    cont++;
                    if (cont == operation.sctids.length) {
                        cont = 0;
                        for (var j = 0; j < records.length; j++) {

                            sctid.save(records[j], function (err) {
                                if (err) {
                                    error = true;
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
                    error = true;
                    callback("Cannot " + operation.action + " SCTID:" + sctIdRecord.sctid + ", current status: " + sctIdRecord.status);
                    return;
                }
            }
        });
    }
};

var getSctid=function (sctId, systemId, callback) {
    Sync(function () {

        if (!sctIdHelper.validSCTId(sctId)) {
            callback("Not valid SCTID:" + sctId, null);
            return;
        }
        var objQuery = {sctid: sctId};
        var sctIdRecord = sctid.findById.sync(null, objQuery);
        if (!sctIdRecord) {

            try {
                var record = getFreeRecord.sync(null, sctId, systemId);
                callback(null, record);
            } catch (e) {
                callback(e, null);
            }
        } else {
            callback(null, sctIdRecord);
        }
    });
};


function insertSCTIDRecord(newSctidRecord, callback){
    Sync(function() {
        try {
            var newSctidRecord2 = sctid.create.sync(null, newSctidRecord);
            callback(null, newSctidRecord2);
        }catch(e){
            callback(e,null);
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
        try{
            var rec=setAvailableSCTIDRecord2NewStatus.sync(null, operation);
            if (!rec) {

                setNewSCTIdRecord.sync(null, operation, thisPartition);
            }
            callback(null);

        } catch (e) {
            callback(e);
        }
    });
};

function setAvailableSCTIDRecord2NewStatus(operation, callback){
    Sync(function () {
        try {
            var query = {
                namespace: parseInt(operation.namespace),
                partitionId: operation.partitionId,
                status: stateMachine.statuses.available
            };

            var sctIdRecords = sctid.find.sync(null, query,1,null);

            if (sctIdRecords && sctIdRecords.length > 0) {

                var action = operation.action;
                if (operation.systemId && operation.systemId.trim() != "") {
                    sctIdRecords[0].systemId = operation.systemId;
                }

                var newStatus = stateMachine.getNewStatus(sctIdRecords[0].status, action);
                if (newStatus) {

                    sctIdRecords[0].status = newStatus;
                    sctIdRecords[0].author = operation.author;
                    sctIdRecords[0].software = operation.software;
                    sctIdRecords[0].expirationDate = operation.expirationDate;
                    sctIdRecords[0].comment = operation.comment;
                    sctIdRecords[0].jobId = operation.jobId;
                    sctid.save.sync(null,sctIdRecords[0]);
                    callback(null,true);
                } else {
                    callback(null,false);
                }

            } else {
                callback(null,false);
            }
        } catch (e) {
            var error = "error:" + e;
            console.error(error); // something went wrong
            callback(error,null);
        }
    });
}

function setNewSCTIdRecord(operation,thisPartition,callback) {
    Sync(function () {
        try {

            thisPartition.sequence = thisPartition.sequence + 1;
            var seq = thisPartition.sequence;
            var newSCTId = computeSCTID(operation, seq);
            var systemId ;
            var action=operation.action;
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
                //sctIdRecord.save.sync(null);
                sctid.save.sync(null,sctIdRecord);
                callback(null);
            } else {
                setNewSCTIdRecord.sync(null, operation, thisPartition);
                callback(null);
            }
        } catch (e) {
            var error="error:" + e;
            console.error(error); // something went wrong
            callback(error);
        }
    });
};

function getPartition(key,callback) {
    model.partitions.get(key, function (err, partitions) {
        if (err) {
            callback(err, null);
        } else {
            if (!partitions) {
                callback("Partition not found for key:" + JSON.stringify(key), null);
            } else {
                callback(null, partitions);
            }
        }
    });
};

var generateSctids=function (operation, callback) {
    getModel(function (err) {
        if (err) {
            console.log("error model:" + err);
            callback(err);
        } else {
            var cont = 0;
            var key = [parseInt(operation.namespace), operation.partitionId.toString()];

            getPartition(key, function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    if (!data) {
                        callback("Partition not found for key:" + JSON.stringify(key));
                    }
                    var thisPartition = data;
                    Sync(function () {
                        var canContinue;
                        for (var i = 0; i < operation.quantity; i++) {
                            canContinue = true;

                            try {
                                operation.systemId = operation.systemIds[i];
                                if (!operation.autoSysId) {
                                    var sctIdRecord = getSyncSctidBySystemId.sync(null, operation.namespace, operation.systemId);
                                    if (sctIdRecord != null) {
                                        sctIdRecord.jobId = operation.jobId;
                                        sctid.save.sync(null,sctIdRecord);
                                        canContinue = false;
                                    }
                                }
                                if (canContinue) {
                                    generateSctid.sync(null, operation, thisPartition);
                                }
                                cont++;
                                if (operation.quantity == cont) {
                                    thisPartition.save(function (err) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            callback(null);
                                        }
                                    });
                                }
                            } catch (e) {
                                console.error("generateSctids error:" + e); // something went wrong
                                callback(e);
                            }
                        }
                    });
                }
            });
        }
    });
};

module.exports.generateSctids=generateSctids;
module.exports.registerSctids=registerSctids;
module.exports.getSctidBySystemIds=getSctidBySystemIds;
module.exports.getSctids=getSctids;
module.exports.updateSctids=updateSctids;