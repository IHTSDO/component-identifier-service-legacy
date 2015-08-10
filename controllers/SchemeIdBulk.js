/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
var idDM=require("./../blogic/SchemeIdBulkDataManager");
var bulkDM=require("./../blogic/BulkJobDataManager");
var job=require("../model/JobType");
var namespace = require("./../blogic/NamespaceDataManager");

function isAbleUser(schemeName, user){
    var able = false;
    security.admins.forEach(function(admin){
        if (admin == user)
            able = true;
    });
    if (!able){
        if (schemeName != "false"){
            scheme.getPermissions(schemeName, function(err, permissions) {
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

module.exports.getSchemeIds = function getSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var schemeIds = req.swagger.params.schemeIds.value;
    var schemeIdsArray = schemeIds.replace(/ /g,"").split(",");
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }

        if (isAbleUser(schemeName, data.user.name)){
            idDM.getSchemeIds(schemeName, schemeIdsArray,function(err,SchemeIdRecords){
                if (err) {
                    return next(err.message);
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(SchemeIdRecords));
            });
        }else
            return next("No permission for the selected operation");
    });
};

module.exports.generateSchemeIds = function generateSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var generationMetadata = req.swagger.params.generationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (generationMetadata.systemIds && generationMetadata.systemIds.length!=0 && generationMetadata.systemIds.length!=generationMetadata.quantity){
                return next("SystemIds quantity is not equal to quantity requirement");
            }

            if (!generationMetadata.systemIds || generationMetadata.systemIds.length==0){
                generationMetadata.autoSysId=true;
            }
            generationMetadata.author=data.user.name;
            generationMetadata.model=job.MODELS.SchemeId;
            generationMetadata.scheme=schemeName;
            bulkDM.saveJob(generationMetadata,job.JOBTYPE.generateSchemeIds,function(err,bulkJobRecord){
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


module.exports.registerSchemeIds = function registerSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var registrationMetadata = req.swagger.params.registrationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (!registrationMetadata.records || registrationMetadata.records.length==0){

                return next("Records property cannot be empty.");
            }
            registrationMetadata.author=data.user.name;
            registrationMetadata.model=job.MODELS.SchemeId;
            registrationMetadata.scheme=schemeName;
            bulkDM.saveJob(registrationMetadata,job.JOBTYPE.registerSchemeIds,function(err,bulkJobRecord){
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

module.exports.reserveSchemeIds = function reserveSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var reservationMetadata = req.swagger.params.reservationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (!reservationMetadata.quantity || reservationMetadata.quantity<1){

                return next("Quantity property cannot be lower to 1.");
            }
            reservationMetadata.author=data.user.name;
            reservationMetadata.model=job.MODELS.SchemeId;
            reservationMetadata.scheme=schemeName;
            bulkDM.saveJob(reservationMetadata,job.JOBTYPE.reserveSchemeIds,function(err,bulkJobRecord){
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

module.exports.deprecateSchemeIds = function deprecateSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var deprecationMetadata = req.swagger.params.deprecationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (!deprecationMetadata.schemeIds || deprecationMetadata.schemeIds.length<1){

                return next("SchemeIds property cannot be empty.");
            }
            deprecationMetadata.author=data.user.name;
            deprecationMetadata.model=job.MODELS.SchemeId;
            deprecationMetadata.scheme=schemeName;
            bulkDM.saveJob(deprecationMetadata,job.JOBTYPE.deprecateSchemeIds,function(err,bulkJobRecord){
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

module.exports.releaseSchemeIds = function releaseSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var releaseMetadata = req.swagger.params.releaseMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (!releaseMetadata.schemeIds || releaseMetadata.schemeIds.length<1){

                return next("SchemeIds property cannot be empty.");
            }
            releaseMetadata.author=data.user.name;
            releaseMetadata.model=job.MODELS.SchemeId;
            releaseMetadata.scheme=schemeName;
            bulkDM.saveJob(releaseMetadata,job.JOBTYPE.releaseSchemeIds,function(err,bulkJobRecord){
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

module.exports.publishSchemeIds = function publishSchemeIds (req, res, next) {
    var token = req.swagger.params.token.value;
    var schemeName = req.swagger.params.schemeName.value;
    var publicationMetadata = req.swagger.params.publicationMetadata.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (isAbleUser(schemeName, data.user.name)){
            if (!publicationMetadata.schemeIds || publicationMetadata.schemeIds.length<1){

                return next("SchemeIds property cannot be empty.");
            }
            publicationMetadata.author=data.user.name;
            publicationMetadata.model=job.MODELS.SchemeId;
            publicationMetadata.scheme=schemeName;
            bulkDM.saveJob(publicationMetadata,job.JOBTYPE.publishSchemeIds,function(err,bulkJobRecord){
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
