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
    var t2 = new Date().getTime();
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

            var t3 = new Date().getTime();
            console.log("getJobRecords took: " + (t3 - t2) + " milisecs");
        });
    });
};

module.exports.cleanUpExpiredIds=function cleanUpExpiredIds(req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function (err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        isAbleUser(data.user.name, function (able) {
            if (able) {
                cleanDM.cleanUpExpiredIds(function (err, dbInfo) {
                    if (err) {
                        return next(err.message);
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(dbInfo));
                    }
                });
            } else {
                return next({message:"No permission for the selected operation",statusCode:400});
            }
        });
    });
};

