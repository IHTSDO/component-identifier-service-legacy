/**
 * Created by ar on 7/30/15.
 */

var job=require("../model/JobType");
var sctid=require("../model/sctid");
var schemeid=require("../model/schemeid");
var bulkJob=require("../model/job");
var idBulk = require("./../blogic/BulkIdCreation");

function saveJob(operation, type, callback) {
    var obj = getNewBulkJobObject(operation, type);
    bulkJob.create(obj, function (err, newJob) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, newJob);

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
    bulkJob.findFieldSelect({}, {id:1,name:1,status:1, created_at:1,modified_at:1},100,null,{ "created_at": "D" },function (err, bulkJobRecords) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, bulkJobRecords);
    });
}

function getJob(jobId, callback) {

    bulkJob.findById({id: parseInt(jobId)}, function (err, bulkJobRecord) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, bulkJobRecord);
    });
}

function getJobRecords(jobId, callback) {

    bulkJob.findById({id: parseInt(jobId)}, function (err, jobRecord) {
        if (err) {
            callback(err, null);
            return;
        }
        if (jobRecord) {
            jobRecord.request = JSON.parse(jobRecord.request);
            if (jobRecord.request.model == job.MODELS.SchemeId) {
                schemeid.findByJobId({jobId: parseInt(jobId)}, function (err, schemeIds) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    if (!schemeIds || schemeIds.length == 0) {

                        callback(null, null);
                        return;
                    }
                    callback(null, schemeIds);
                    return;
                });
            } else {
                if (jobRecord.request.type == job.JOBTYPE.generateSctids) {

                    //var t2 = new Date().getTime();
                    sctid.recordExists({jobId: parseInt(jobId)}, function(err,exists) {

                        if (err) {
                            callback(err, null);
                            return;
                        }
                        if (!exists) {
                            console.log("generating records for jobId: " + jobId);
                            jobRecord.request.jobId = jobId;
                            idBulk.idsRetrieve(jobRecord.request, function (err, sctids) {
                                if (err) {
                                    callback({message:err,number:404}, null);
                                    return;
                                }
                                if (!sctids || sctids.length == 0) {

                                    callback(null, null);
                                    return;
                                }
                                callback(null, sctids);
                                //var t3 = new Date().getTime();
                                //console.log("retrieving job records took: " + (t3 - t2) + " milisecs");
                                return;

                            });
                        } else {
                            console.log("already exists jobId: " + jobId);


                            sctid.findJustSctIdByJobId({jobId: parseInt(jobId)}, function (err, sctids) {
                                if (err) {
                                    callback(err, null);
                                    return;
                                }
                                if (!sctids || sctids.length == 0) {

                                    callback(null, null);
                                    return;
                                }
                                callback(null, sctids);
                                //var t3 = new Date().getTime();
                                //console.log("getting existent job records took: " + (t3 - t2) + " milisecs");
                                return;
                            });
                        }
                    });
                }else {
                    sctid.findByJobId({jobId: parseInt(jobId)}, function (err, sctids) {
                        if (err) {
                            callback(err, null);
                            return;
                        }
                        if (!sctids || sctids.length == 0) {

                            callback(null, null);
                            return;
                        }
                        callback(null, sctids);
                        return;
                    });
                }
            }
        }
    });
}

module.exports.saveJob=saveJob;
module.exports.getJobRecords=getJobRecords;
module.exports.getJob=getJob;
module.exports.getJobs=getJobs;
