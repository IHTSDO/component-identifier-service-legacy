/**
 * Created by ar on 7/30/15.
 */

var dbInit=require("../config/dbInit");
var schIdDM = require("./../blogic/SchemeIdDataManager");
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

function saveJob(operation, type, callback){
    getModel(function(err){
        if (err){
            callback(err,null);
            return;
        }
        var obj=getNewBulkJobObject(operation, type);
        model.bulkJob.create(obj,function(err,newJob){
            if (err){
                callback(err,null);
                return;
            }
            callback(null,newJob);

        });

    });
}

function getNewBulkJobObject(operation, type) {
    operation.type = type;
    var bulkJobRecord = {
        name: type ,
        status: "0",
        request:operation
    };
    return bulkJobRecord;
}

function getJobs(callback) {
    getModel(function (err) {
        if (err) {
            callback(err, null);
            return;

        }

        model.bulkJob.all(function (err, bulkJobRecords) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, bulkJobRecords);
        });
    });
}

function getJob(jobId, callback) {
    getModel(function (err) {
        if (err) {
            callback(err, null);
            return;

        }

        model.bulkJob.get(parseInt(jobId), function (err, bulkJobRecord) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, bulkJobRecord);
        });
    });
}

function getJobRecords(jobId, callback) {
    getModel(function (err) {
        if (err) {
            callback(err, null);
            return;

        }

        model.sctId.find({jobId: parseInt(jobId)},function( err, sctids) {
            if (!sctids || sctids.length==0){

                callback(null,null);
                return;
            }
            callback(null, sctids);
            return;
            //var cont=0;
            //var error=false;
            //for (var i=0;i<sctids.length;i++) {
            //    sctids[i].additionalIds = [];
            //    console.log("sctids[" + i + "].systemId:" + sctids[i].systemId);
            //    var systemId=sctids[i].systemId;
            //    if (error){
            //        return;
            //    }
            //    schIdDM.getSchemeIdBySystemId("CTV3ID", systemId, function (err, schemeIdRecord) {
            //        if (err) {
            //            error=true;
            //            callback("snomedid search :" + err, null);
            //            return;
            //        }
            //        if (schemeIdRecord) {
            //            sctids[i].additionalIds.push(schemeIdRecord);
            //            var systemId2 = schemeIdRecord.systemId;
            //            //console.log("cont i:" + i);
            //            console.log(systemId2);
            //            schIdDM.getSchemeIdBySystemId("SNOMEDID", systemId2, function (err, schemeIdRecord2) {
            //                if (err) {
            //                    error=true;
            //                    callback(err, null);
            //                    return;
            //                }
            //                if (schemeIdRecord2) {
            //                    sctids[i].additionalIds.push(schemeIdRecord2);
            //                }
            //                cont++;
            //                if (cont == sctids.length) {
            //                    callback(null, sctids);
            //                    return;
            //
            //                }
            //            });
            //        }else{
            //
            //            cont++;
            //            if (cont == sctids.length) {
            //                callback(null, sctids);
            //                return;
            //
            //            }
            //        }
            //
            //    });
            //}
        });
    });
}

module.exports.saveJob=saveJob;
module.exports.getJobRecords=getJobRecords;
module.exports.getJob=getJob;
module.exports.getJobs=getJobs;
