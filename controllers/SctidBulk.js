/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM=require("./../blogic/SCTIdBulkDataManager");
var bulkDM=require("./../blogic/BulkJobDataManager");
//var schemeIdDM=require("./../blogic/SchemeIdBulkDataManager");
var namespace = require("./../blogic/NamespaceDataManager");

function isAbleUser(namespaceId, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (namespaceId != "false"){
            namespace.getPermissions(namespaceId, function(err, permissions) {
                if (err)
                    return next(err.message);
                else{
                    permissions.forEach(function(permission){
                        if (permission.username == user)
                            able = true;
                    });
                    return able;
                }
            });
        }else
            return able;
    }else
        return able;
}

module.exports.getSctids = function getSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var sctids = req.swagger.params.sctids.value;
    var sctidsArray = sctids.replace(/ /g,"").split(",");
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.getSctids(sctidsArray,function(err,records){
            if (err){
                return next(err.message);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(records));
        });
    });
};

module.exports.getSctidBySystemIds = function getSctidBySystemIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var systemIds = req.swagger.params.systemIds.value;
    var namespaceId = req.swagger.params.namespaceId.value;
    var systemIdsArray = systemIds.replace(/ /g,"").split(",");
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        idDM.getSctidBySystemIds(namespaceId,systemIdsArray,function(err,records){
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

module.exports.generateSctids = function generateSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var generationData = req.swagger.params.generationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(generationData.namespace, data.user.name)){
            if (generationData.systemIds && generationData.systemIds.length!=0 && generationData.systemIds.length!=generationData.quantity){
                return next("SystemIds quantity is not equal to quantity requirement");
            }
            generationData.author=data.user.name;
            bulkDM.saveJob(generationData,"Generate SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};


module.exports.registerSctids = function registerSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var registrationData = req.swagger.params.registrationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(registrationData.namespace, data.user.name)){
            if (!registrationData.records || registrationData.records.length==0){

                return next("Records property cannot be empty.");
            }
            registrationData.author=data.user.name;
            bulkDM.saveJob(registrationData,"Register SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.reserveSctids = function reserveSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var reservationData = req.swagger.params.reservationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(reservationData.namespace, data.user.name)){
            if (!reservationData.quantity || reservationData.quantity<1){

                return next("Quantity property cannot be lower to 1.");
            }
            reservationData.author=data.user.name;
            bulkDM.saveJob(reservationData,"Reserve SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.deprecateSctids = function deprecateSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var deprecationData = req.swagger.params.deprecationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(deprecationData.namespace, data.user.name)){
            if (!deprecationData.sctids || deprecationData.sctids.length<1){

                return next("Sctids property cannot be empty.");
            }
            deprecationData.author=data.user.name;
            bulkDM.saveJob(deprecationData,"Deprecate SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.releaseSctids = function releaseSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var releaseData = req.swagger.params.releaseData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(releaseData.namespace, data.user.name)){
            if (!releaseData.sctids || releaseData.sctids.length<1){

                return next("Sctids property cannot be empty.");
            }
            releaseData.author=data.user.name;
            bulkDM.saveJob(releaseData,"Release SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.publishSctids = function publishSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var publicationData = req.swagger.params.publicationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(publicationData.namespace, data.user.name)){
            if (!publicationData.sctids || publicationData.sctids.length<1){

                return next("Sctids property cannot be empty.");
            }
            publicationData.author=data.user.name;
            bulkDM.saveJob(publicationData,"Publish SctIds",function(err,bulkJobRecord){
                if (err) {

                    return next(err.message);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else
            return next("No permission for the selected operation");
    });
};
