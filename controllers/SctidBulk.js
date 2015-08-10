/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM=require("./../blogic/SCTIdBulkDataManager");
var bulkDM=require("./../blogic/BulkJobDataManager");
var job=require("../model/JobType");
var namespace = require("./../blogic/NamespaceDataManager");
var sctIdHelper = require("./../utils/SctIdHelper");
var schemeDM = require("./../blogic/SchemeDataManager");

function isAbleUser(namespaceId, user, res){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (namespaceId != "false"){
            namespace.getPermissions(namespaceId, function(err, permissions) {
                if (err){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }else{
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

function isSchemeAbleUser(schemeName, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (schemeName != "false"){
            schemeDM.getPermissions(schemeName, function(err, permissions) {
                if (err){
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }else{
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
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        idDM.getSctids(sctidsArray,function(err,records){
            if (err){
                res.setHeader('Content-Type', 'application/json');
                res.status(500);
                res.end(JSON.stringify({message: err.message}));
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
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        idDM.getSctidBySystemIds(namespaceId,systemIdsArray,function(err,records){
            if (err){
                res.setHeader('Content-Type', 'application/json');
                res.status(500);
                res.end(JSON.stringify({message: err.message}));
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
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        if (isAbleUser(generationData.namespace, data.user.name, res)){
            if ((generationData.namespace==0 && generationData.partitionId.substr(0,1)!="0")
                || (generationData.namespace!=0 && generationData.partitionId.substr(0,1)!="1")){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Namespace and partitionId parameters are not consistent."}));
            }
            if (generationData.systemIds && generationData.systemIds.length!=0 && generationData.systemIds.length!=generationData.quantity){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "SystemIds quantity is not equal to quantity requirement"}));
            }
            generationData.author=data.user.name;
            generationData.model=job.MODELS.SctId;

            if ((!generationData.systemIds || generationData.systemIds.length==0)
                && (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE" &&
                    generationData.partitionId.substr(1,1)=="0")) {
                var arrayUuids=[];
                for (var i=0;i<generationData.quantity;i++){
                    arrayUuids.push(guid());
                }
                generationData.systemIds=arrayUuids;
            }
                var additionalJobs=[];


            bulkDM.saveJob(generationData,job.JOBTYPE.generateSctids,function(err,sctIdBulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                if (generationData.generateLegacyIds && generationData.generateLegacyIds.toUpperCase()=="TRUE" &&
                    generationData.partitionId.substr(1,1)=="0") {

                    var generationMetadata=JSON.parse(JSON.stringify(generationData));
                    delete generationMetadata.namespace;
                    delete generationMetadata.partitionId;
                    generationMetadata.model=job.MODELS.SchemeId;
                    if (!isSchemeAbleUser("SNOMEDID", data.user.name)) {
                        if (isSchemeAbleUser("CTV3ID", data.user.name)) {

                            var generationCTV3IDMetadata=JSON.parse(JSON.stringify(generationMetadata));
                            generationCTV3IDMetadata.scheme = 'CTV3ID';
                            bulkDM.saveJob(generationCTV3IDMetadata, job.JOBTYPE.generateSchemeIds, function (err, ctv3IdBulkJobRecord) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(500);
                                    res.end(JSON.stringify({message: err.message}));
                                }
                                additionalJobs.push(ctv3IdBulkJobRecord);
                                sctIdBulkJobRecord.additionalJobs=additionalJobs;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(sctIdBulkJobRecord));
                            });


                        }else{
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(sctIdBulkJobRecord));

                        }
                    }else {
                        generationMetadata.scheme = 'SNOMEDID';
                        bulkDM.saveJob(generationMetadata, job.JOBTYPE.generateSchemeIds, function (err, snoIdBulkJobRecord) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(500);
                                res.end(JSON.stringify({message: err.message}));
                            }

                            additionalJobs.push(snoIdBulkJobRecord);
                            if (!isSchemeAbleUser("CTV3ID", data.user.name)) {
                                sctIdBulkJobRecord.additionalJobs = additionalJobs;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(sctIdBulkJobRecord));

                            }else{
                                var generationCTV3IDMetadata = JSON.parse(JSON.stringify(generationMetadata));
                                generationCTV3IDMetadata.scheme = 'CTV3ID';
                                bulkDM.saveJob(generationCTV3IDMetadata, job.JOBTYPE.generateSchemeIds, function (err, ctv3IdBulkJobRecord) {
                                    if (err) {
                                        res.setHeader('Content-Type', 'application/json');
                                        res.status(500);
                                        res.end(JSON.stringify({message: err.message}));
                                    }
                                    additionalJobs.push(ctv3IdBulkJobRecord);
                                    sctIdBulkJobRecord.additionalJobs = additionalJobs;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify(sctIdBulkJobRecord));
                                });
                            }
                        });

                    }
                }else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sctIdBulkJobRecord));
                }
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
        }
    });
};


module.exports.registerSctids = function registerSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var registrationData = req.swagger.params.registrationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }

        if (isAbleUser(registrationData.namespace, data.user.name, res)){

            if (!registrationData.records || registrationData.records.length==0){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Records property cannot be empty."}));
            }
            var namespace;
            var error=false;
            registrationData.records.forEach(function(record){
                if (error) return;
                namespace = sctIdHelper.getNamespace(record.sctid);
                if (namespace!=registrationData.namespace){
                    error=true;
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400);
                    res.end(JSON.stringify({message: "Namespaces differences between sctid: " + record.sctid + " and parameter: " + registrationData.namespace}));
                }
            });
            if (error) return;
            registrationData.author=data.user.name;
            registrationData.model=job.MODELS.SctId;
            bulkDM.saveJob(registrationData,job.JOBTYPE.registerSctids,function(err,bulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
        }
    });
};

module.exports.reserveSctids = function reserveSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var reservationData = req.swagger.params.reservationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        if (isAbleUser(reservationData.namespace, data.user.name, res)){

            if ((reservationData.namespace==0 && reservationData.partitionId.substr(0,1)!="0")
                || (reservationData.namespace!=0 && reservationData.partitionId.substr(0,1)!="1")){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Namespace and partitionId parameters are not consistent."}));
            }
            if (!reservationData.quantity || reservationData.quantity<1){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Quantity property cannot be lower to 1."}));
            }
            reservationData.author=data.user.name;
            reservationData.model=job.MODELS.SctId;
            bulkDM.saveJob(reservationData,job.JOBTYPE.reserveSctids,function(err,bulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
        }
    });
};

module.exports.deprecateSctids = function deprecateSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var deprecationData = req.swagger.params.deprecationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        if (isAbleUser(deprecationData.namespace, data.user.name, res)){
            if (!deprecationData.sctids || deprecationData.sctids.length<1){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Sctids property cannot be empty."}));
            }

            var namespace;
            var error=false;
            deprecationData.sctids.forEach(function(sctid){
                if (error) return;
                namespace = sctIdHelper.getNamespace(sctid);
                if (namespace!=deprecationData.namespace){
                    error=true;
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400);
                    res.end(JSON.stringify({message: "Namespaces differences between sctid: " + sctid + " and parameter: " + deprecationData.namespace}));
                }
            });
            if (error) return;
            deprecationData.author=data.user.name;
            deprecationData.model=job.MODELS.SctId;
            bulkDM.saveJob(deprecationData,job.JOBTYPE.deprecateSctids,function(err,bulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
        }
    });
};

module.exports.releaseSctids = function releaseSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var releaseData = req.swagger.params.releaseData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        if (isAbleUser(releaseData.namespace, data.user.name, res)){
            if (!releaseData.sctids || releaseData.sctids.length<1){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Sctids property cannot be empty."}));
            }

            var namespace;
            var error=false;
            releaseData.sctids.forEach(function(sctid){
                if (error) return;
                namespace = sctIdHelper.getNamespace(sctid);
                if (namespace!=releaseData.namespace){
                    error=true;
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400);
                    res.end(JSON.stringify({message: "Namespaces differences between sctid: " + sctid + " and parameter: " + releaseData.namespace}));
                }
            });
            if (error) return;
            releaseData.author=data.user.name;
            releaseData.model=job.MODELS.SctId;
            bulkDM.saveJob(releaseData,job.JOBTYPE.releaseSctids,function(err,bulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
        }
    });
};

module.exports.publishSctids = function publishSctids (req, res, next) {
    var token = req.swagger.params.token.value;
    var publicationData = req.swagger.params.publicationData.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }
        if (isAbleUser(publicationData.namespace, data.user.name, res)){
            if (!publicationData.sctids || publicationData.sctids.length<1){
                res.setHeader('Content-Type', 'application/json');
                res.status(400);
                res.end(JSON.stringify({message: "Sctids property cannot be empty."}));
            }

            var namespace;
            var error=false;
            publicationData.sctids.forEach(function(sctid){
                if (error) return;
                namespace = sctIdHelper.getNamespace(sctid);
                if (namespace!=publicationData.namespace){
                    error=true;
                    res.setHeader('Content-Type', 'application/json');
                    res.status(400);
                    res.end(JSON.stringify({message: "Namespaces differences between sctid: " + sctid + " and parameter: " + publicationData.namespace}));
                }
            });
            if (error) return;
            publicationData.author=data.user.name;
            publicationData.model=job.MODELS.SctId;
            bulkDM.saveJob(publicationData,job.JOBTYPE.publishSctids,function(err,bulkJobRecord){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(bulkJobRecord));
            });
        }else{
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: "No permission for the selected operation"}));
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