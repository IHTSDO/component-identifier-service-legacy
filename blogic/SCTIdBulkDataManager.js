/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var sctIdHelper=require("../utils/SctIdHelper");
var db={};
var model;
var sets=require('simplesets');

function getModel(callback){
    if (model){
        console.log("Model from cache.");
        callback(null);
    }else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err);
            }else {

                db = pdb;
                model = podel1;
                console.log("Model from dbinit.");
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
                }
                var resArray=[];
                sctIdRecords.forEach(function(sctIdRecord){
                    resArray.push(sctIdRecord.sctid);
                });
                var rA=sets.StringSet(resArray);
                var rQ=sets.StringSet(sctidArray);
                var diff=rQ.difference(rA).array();

                if (diff){
                    diff.forEach(function(rec){
                        sctIdRecords.push(getFreeRecord(rec));
                    });
                }
                callback(null, sctIdRecords);
            });
        }
    });
};

function getFreeRecord(sctid){
    var sctIdRecord= {
        "sctid": sctid,
        "status": "Free"
    };
    return sctIdRecord;
}

var getSctidBySystemId=function (namespaceId,systemId, callback){
    var objQuery={namespace: namespaceId, systemId:systemId};
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
    model.sctIdTable.find(objQuery, function (err, sctids) {
        if (err) {
            callback(err,null);
        }else {
            callback(null, sctids);
        }
    });
};


var sctIdGenerate=function (operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            getNextNumber(operation, function (err, seq) {
                if (err) {
                    callback(err, null);
                }else {
                    var newSCTId = computeSCTID(operation, seq);

                    insertSCTIDRecord(operation, newSCTId, seq, "assigned", function (err, sctIdRecord) {
                        if (err) {
                            callback(err, null);
                        }else {
                            callback(null, sctIdRecord);
                        }
                    });
                }
            });
        }
    });
};

var sctIdReserve=function (operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        }else {
            getNextNumber( operation, function (err, seq) {
                if (err) {
                    callback(err, null);
                }else {
                    var newSCTId = computeSCTID(operation, seq);
                    console.log("newSCTId:" + newSCTId);
                    insertSCTIDRecord(operation, newSCTId, seq, "reserved", function (err, sctIdRecord) {
                        if (err) {
                            callback(err, null);
                        }else {
                            callback(null, sctIdRecord);
                        }
                    });
                }
            });
        }
    });
};

var sctIdUpdate=function (operation, status, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);
        }else {
            try {
                var sctid = operation.sctid;
                var sequence;
                if (operation.namespace == 0) {
                    sequence = sctid.substr(0, sctid.length - 3);
                } else {
                    sequence = sctid.substr(0, sctid.length - 10);
                }
                var sctidRecord = {
                    sctid: sctid,
                    sequence: parseInt(sequence),
                    namespace: operation.namespace,
                    partitionId: operation.partitionId,
                    checkDigit: sctid.substr(sctid.length - 1, 1),
                    systemId: operation.systemId,
                    status: status,
                    author: operation.author,
                    software: operation.software,
                    expirationDate: operation.expirationDate,
                    comment: operation.comment
                };

                updateSCTIDRecord(sctidRecord, function (err, sctIdRecord) {
                    if (err) {
                        callback(err, null);
                    }
                    callback(null, sctIdRecord);
                });
            } catch (e) {
                callback(e, null);
            }
        }
    });
};

function getNextNumber( operation, callback){
    var key=[parseInt(operation.namespace),operation.partitionId.toString()];
    model.namespaceTable.get(key,function(err, namespaces){
        var nextNumber=namespaces.sequence;
        namespaces.sequence++;
        namespaces.save(function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,nextNumber);
            }
        })
    });
};

function updateSCTIDRecord(sctidRecord, callback){
    model.sctIdTable.get(sctidRecord.sctid ,function(err, sctIdRecord){
        sctIdRecord.save(sctidRecord,function(err){
            if (err){
                callback(err,null);
            }else{
                callback(null,sctIdRecord);
            }
        })
    });
}

function insertSCTIDRecord(operation, sctid, sequence, status, callback){
    var newSctidRecord={
        sctid: sctid,
        sequence: sequence,
        namespace: operation.namespace,
        partitionId: operation.partitionId,
        checkDigit: sctid.substr(sctid.length-1,1),
        systemId: operation.systemId,
        status: status,
        author: operation.author,
        software: operation.software,
        expirationDate: operation.expirationDate,
        comment: operation.comment
    };
    model.sctIdTable.create(newSctidRecord, function (err) {
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

module.exports.sctIdGenerate=sctIdGenerate;
module.exports.sctIdReserve=sctIdReserve;
module.exports.getSctidBySystemId=getSctidBySystemId;
module.exports.getSctid=getSctids;
module.exports.sctIdUpdate=sctIdUpdate;