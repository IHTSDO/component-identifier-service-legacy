/**
 * Created by ar on 7/31/15.
 */


var dbInit=require("../config/dbInit");
var job=require("../model/JobType");
var idDM = require("./../blogic/SCTIdBulkDataManager");
var stateMachine=require("../model/StateMachine");
var sctIdHelper=require("../utils/SctIdHelper");
var db;
var model;

function getModel(){
    if (!model){
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                process.nextTick(err.message);
            }else {

                db = pdb;
                model = podel1;
            }
        })
    }
}

var throwErrMessage=function(msg){
    var err={};
    err.message=msg;
    return err;
};
getModel();

var runner = function (){
    model.bulkJob.find({status:"1"},function(err,records){
        if (records&& records.length>0){
            console.log("running job.");
            return;
        }
        model.bulkJob.find({status:0}, [ "created_at", "A" ],function(err,bulkJobRecords) {
            if (bulkJobRecords&& bulkJobRecords.length>0) {
                bulkJobRecords[0].status="1";
                bulkJobRecords[0].save(function(err){
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
    var request=record.request;

    if (request.type==job.JOBTYPE.generateSctids) {
        if (!request.systemIds || request.systemIds.length==0){
            var arrayUuids=[];
            for (var i=0;i<request.quantity;i++){
                arrayUuids.push(guid());
            }
            request.systemIds=arrayUuids;
        }
        request.jobId=record.id;
        idDM.generateSctids(request, function(err){
            if (err){
                record.status="3";
                record.log=err.toString();
            }else{
                record.status="2";
            }
            record.save(function(err){
                if (err){
                    console.log("Error-2 in back end service:" + err);
                    return;
                }else{
                    console.log("Normal end job " + record.name + " - id:" + record.id);
                }
            });
        });
    }else if (request.type==job.JOBTYPE.registerSctids){
    }else if (request.type==job.JOBTYPE.reserveSctids){
    }else if (request.type==job.JOBTYPE.deprecateSctids){
    }else if (request.type==job.JOBTYPE.releaseSctids){
    }else if (request.type==job.JOBTYPE.publishSctids) {
    }


    console.log("End process");

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

