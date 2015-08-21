/**
 * Created by ar on 8/3/15.
 */

'use strict';

var security = require("./../blogic/Security");
var bulkDM=require("./../blogic/BulkJobDataManager");
var cleanDM=require("./../blogic/CleanService");

function isAbleUser( user, callback){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    callback(able);
}
module.exports.getJobs =function getJobs(req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
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
            return next({message: err.message, statusCode: 401});
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
            return next({message: err.message, statusCode: 401});
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

module.exports.cleanUpExpiredIds=function cleanUpExpiredIds(req, res, next) {
    console.log("step 1");
    var token = req.swagger.params.token.value;
    security.authenticate(token, function (err, data) {
        if (err) {
            console.log("step 2");
            return next({message: err.message, statusCode: 401});
        }
        console.log("step 3");
        isAbleUser(data.user.name, function (able) {
            console.log("step 4");
            if (able) {
                console.log("step 5");
                cleanDM.cleanUpExpiredIds(function (err, dbInfo) {
                    if (err) {
                        console.log("step 6");
                        return next(err.message);
                    } else {
                        console.log("step 7");
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(dbInfo));
                    }
                });
            } else {
                console.log("step 8");
                return next("No permission for the selected operation");
            }
        });
    });
};

