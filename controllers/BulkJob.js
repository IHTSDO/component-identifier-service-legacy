/**
 * Created by ar on 8/3/15.
 */

'use strict';

var security = require("./../blogic/Security");
var bulkDM=require("./../blogic/BulkJobDataManager");

module.exports.getJobs =function getJobs(req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        bulkDM.getJobs(function(err,records){
            if (err){
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
        });
    });
};

module.exports.getJob=function getJob(req, res, next) {
    var token = req.swagger.params.token.value;
    var jobId = req.swagger.params.jobId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        bulkDM.getJob(jobId,function(err,record){
            if (err){
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(record));
        });
    });
};

module.exports.getJobRecords=function getJobRecords(req, res, next) {
    var token = req.swagger.params.token.value;
    var jobId = req.swagger.params.jobId.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        bulkDM.getJobRecords(jobId,function(err,records){
            if (err){
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
        });
    });
};
