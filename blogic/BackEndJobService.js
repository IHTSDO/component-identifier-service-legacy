/**
 * Created by ar on 7/31/15.
 */

var job=require("../model/JobType");
var bulkJob=require("../model/job");
var idDM = require("./../blogic/SCTIdBulkDataManager");
var sIdDM = require("./../blogic/SchemeIdBulkDataManager");
var stateMachine=require("../model/StateMachine");

var runner = function (){

    bulkJob.findFieldSelect({status:"1"},{id:1},1,null,null,function(err,records){
        if (records&& records.length>0){
            //console.log("running job.");
            return;
        }
        bulkJob.findFieldSelect({status:"0"}, {id:1,name:1,request:1},1,null,{ "created_at": "A" },function(err,bulkJobRecords) {
            if (bulkJobRecords&& bulkJobRecords.length>0) {
                var lightJob={
                    id:bulkJobRecords[0].id,
                    status:"1"
                };
                bulkJobRecords[0].status="1";
                bulkJob.save(lightJob,function(err){
                    if (err){
                        console.log("Error-1 in back end service:" + err);
                        return;
                    }
                    processJob(bulkJobRecords[0]);

                })

            }else{
                return;
            }
        })
    });
};

function processJob(record){

    var request=JSON.parse(record.request);
    if (!request || !request.type || request.type==null){
        var lightJob={
            id:record.id,
            status:"3",
            log:"Request property is null"
        };

        bulkJob.save(lightJob,function(err){
            if (err){
                console.log("Error-14 in back end service:" + err);
            }else{
                console.log("Error: Can not process the job " + record.name + " - id:" + record.id + " -" + lightJob.log);
            }
        });
    }else {
        request.jobId = record.id;

        var lightJob={
            id:record.id
        };
        if (request.type == job.JOBTYPE.generateSctids) {
            if (!request.systemIds || request.systemIds.length == 0) {
                var arrayUuids = [];
                for (var i = 0; i < request.quantity; i++) {
                    arrayUuids.push(guid());
                }
                request.systemIds = arrayUuids;
                request.autoSysId=true;
            }
            request.action = stateMachine.actions.generate;
            if (request.systemIds.length>10) {
                idDM.generateSctids(request, function (err) {

                    if (err) {
                        lightJob.status = "3";
                        if (typeof err == "object") {
                            lightJob.log = JSON.stringify(err);
                        } else {
                            lightJob.log = err;
                        }
                    } else {
                        lightJob.status = "2";
                    }
                    bulkJob.save(lightJob, function (err) {
                        if (err) {
                            console.log("Error-2 in back end service:" + err);
                            return;
                        } else {

                            console.log("End job " + record.name + " - id:" + record.id);
                        }
                    });
                });
            }else{
                idDM.generateSctidsSmallRequest(request, function (err) {

                    if (err) {
                        lightJob.status = "3";
                        if (typeof err == "object") {
                            lightJob.log = JSON.stringify(err);
                        } else {
                            lightJob.log = err;
                        }
                    } else {
                        lightJob.status = "2";
                    }
                    bulkJob.save(lightJob,function (err) {
                        if (err) {
                            console.log("Error-2 in back end service:" + err);
                            return;
                        } else {

                            console.log("End job " + record.name + " - id:" + record.id);
                        }
                    });
                });
            }
        } else if (request.type == job.JOBTYPE.registerSctids) {

            idDM.registerSctids(request, function (err) {

                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-3 in back end service:" + JSON.stringify(err));
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.reserveSctids) {
            if (!request.systemIds || request.systemIds.length == 0) {
                var arrayUuids = [];
                for (var i = 0; i < request.quantity; i++) {
                    arrayUuids.push(guid());
                }
                request.systemIds = arrayUuids;
            }
            request.action = stateMachine.actions.reserve;
            idDM.generateSctids(request, function (err) {

                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-4 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.deprecateSctids) {
            request.action = stateMachine.actions.deprecate;
            idDM.updateSctids(request, function (err) {

                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-5 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.releaseSctids) {
            request.action = stateMachine.actions.release;
            idDM.updateSctids(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-6 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.publishSctids) {
            request.action = stateMachine.actions.publish;
            idDM.updateSctids(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-7 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.generateSchemeIds) {
            if (!request.systemIds || request.systemIds.length == 0) {
                var arrayUuids = [];
                for (var i = 0; i < request.quantity; i++) {
                    arrayUuids.push(guid());
                }
                request.systemIds = arrayUuids;
                request.autoSysId=true;
            }
            request.action = stateMachine.actions.generate;
            if (request.systemIds.length>10) {
                sIdDM.generateSchemeIds(request, function (err) {
                    if (err) {
                        lightJob.status = "3";
                        if (typeof err == "object") {
                            lightJob.log = JSON.stringify(err);
                        } else {
                            lightJob.log = err;
                        }
                    } else {
                        lightJob.status = "2";
                    }
                    bulkJob.save(lightJob, function (err) {
                        if (err) {
                            console.log("Error-8 in back end service:" + err);
                            return;
                        } else {
                            console.log("End job " + record.name + " - id:" + record.id);
                        }
                    });
                });
            }else {
                sIdDM.generateSchemeIdSmallRequest(request, function (err) {
                    if (err) {
                        lightJob.status = "3";
                        if (typeof err == "object") {
                            lightJob.log = JSON.stringify(err);
                        } else {
                            lightJob.log = err;
                        }
                    } else {
                        lightJob.status = "2";
                    }
                    bulkJob.save(lightJob, function (err) {
                        if (err) {
                            console.log("Error-8 in back end service:" + err);
                            return;
                        } else {
                            console.log("End job " + record.name + " - id:" + record.id);
                        }
                    });
                });
            }
        } else if (request.type == job.JOBTYPE.registerSchemeIds) {

            sIdDM.registerSchemeIds(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-9 in back end service:" + JSON.stringify(err));
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.reserveSchemeIds) {
            if (!request.systemIds || request.systemIds.length == 0) {
                var arrayUuids = [];
                for (var i = 0; i < request.quantity; i++) {
                    arrayUuids.push(guid());
                }
                request.systemIds = arrayUuids;
            }
            request.action = stateMachine.actions.reserve;
            sIdDM.generateSchemeIds(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-10 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.deprecateSchemeIds) {
            request.action = stateMachine.actions.deprecate;
            sIdDM.updateSchemeIds(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-11 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.releaseSchemeIds) {
            request.action = stateMachine.actions.release;
            sIdDM.updateSchemeIds(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-12 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        } else if (request.type == job.JOBTYPE.publishSchemeIds) {
            request.action = stateMachine.actions.publish;
            sIdDM.updateSchemeIds(request, function (err) {
                if (err) {
                    lightJob.status = "3";
                    if (typeof err == "object") {
                        lightJob.log = JSON.stringify(err);
                    } else {
                        lightJob.log = err;
                    }
                } else {
                    lightJob.status = "2";
                }
                bulkJob.save(lightJob,function (err) {
                    if (err) {
                        console.log("Error-13 in back end service:" + err);
                        return;
                    } else {
                        console.log("End job " + record.name + " - id:" + record.id);
                    }
                });
            });
        }
    }
}

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

setInterval(runner,3000);

