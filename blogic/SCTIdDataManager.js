/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var sctIdHelper=require("../utils/SctIdHelper");
var db={};
var model;
//dbInit.getDB(function(db,model) {
//
//    model.sctIdTable.create({
//        sctid: "44691001",
//        sequence: 44691,
//        namespace: 0,
//        partitionId: "00",
//        checkDigit: 1,
//        status: "assigned"
//    }, function (err) {
//        if (err) throw err;
//
//        model.sctIdTable.find({sctid: "44691001"}, function (err, sctids) {
//            if (err) throw err;
//
//            console.log("sctids found: %d", sctids.length);
//            console.log("First sctid: %s, %d", sctids[0].sctid, sctids[0].sequence);
//
//        });
//
//    });
//});

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

var getSctid=function (sctid, callback){
    if (!sctIdHelper.validSCTId(sctid)){
        callback("Not valid SCTID.",null);
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
                }
                if (!sctIdRecord) {
                    sctIdRecord = getFreeRecord(sctid);
                }
                callback(null, sctIdRecord);
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
            getSCTIDRecord(objQuery, function (err, sctIdRecord) {
                if (err) {
                    callback(err, null);
                }
                callback(null, sctIdRecord);
            });
        }
    });
};

function getSCTIDRecord(objQuery, callback){
    model.sctIdTable.find(objQuery, function (err, sctids) {
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
module.exports.getSctid=getSctid;
module.exports.sctIdUpdate=sctIdUpdate;