/**
 * Created by ar on 7/31/15.
 */

var sctid=require("../model/sctid");
var idDM = require("./../blogic/SCTIdBulkDataManager");
var sctIdHelper=require("../utils/SctIdHelper");
//var sIdDM = require("./../blogic/SchemeIdBulkDataManager");
var stateMachine=require("../model/StateMachine");
var Sync = require('sync');



var idBulkCreation = function (namespace, partitionId, callback){

    var t1=new Date().getTime();
    console.log("step 11");
    var query={partitionId:partitionId,namespace:namespace, status:stateMachine.statuses.available};
    sctid.count(query,function(err,recs){
        console.log("step 12");
        if (err==null) {
            var quant=100000-recs;
            console.log("step 13 - quant=" + quant);
            if (quant>0) {
                var key = [parseInt(namespace), partitionId.toString()];
                idDM.getModel(function (err) {
                    if (err) {
                        console.log("error model:" + err);
                        callback(err);
                    } else {
                        idDM.getPartition(key, function (err, thisPartition) {
                            if (err) {
                                callback(err);
                            } else {
                                if (!thisPartition) {
                                    callback("Partition not found for key:" + JSON.stringify(key));
                                }
                                var seq = thisPartition.sequence;
                                thisPartition.sequence = thisPartition.sequence + quant;
                                thisPartition.save(function (err) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        var count = 0;
                                        Sync(function () {
                                            for (var i = 0; i < quant; i++) {
                                                count++;
                                                if (count % 1000 == 0) {
                                                    console.log("#" + count);
                                                    var t3 = new Date().getTime();
                                                    console.log("Partial took: " + (t3 - t1) + " milisecs");
                                                }
                                                try {
                                                    seq++;

                                                    var tmpNsp = namespace.toString();
                                                    if (tmpNsp == "0") {
                                                        tmpNsp = "";
                                                    }
                                                    var base = seq + tmpNsp + partitionId.toString();
                                                    var SCTId = base + sctIdHelper.verhoeffCompute(base);


                                                    var objQuery = {sctid: SCTId};
                                                    var sctIdRecord = sctid.findById.sync(null, objQuery);

                                                    if (!sctIdRecord) {

                                                        var systemId = guid();
                                                        idDM.getFreeRecord.sync(null, SCTId, systemId);
                                                    }
                                                } catch (e) {
                                                    callback(e);
                                                }

                                            }

                                            if (count>=quant){
                                                callback(null);
                                            }
                                            var t2 = new Date().getTime();
                                            console.log("Final took: " + (t2 - t1) + " milisecs");
                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            }else{
                callback(null);
            }
        }
    });

};


function getPartition(key,callback) {
    model.partitions.get(key, function (err, partitions) {
        if (err) {
            callback(err, null);
        } else {
            if (!partitions) {
                callback("Partition not found for key:" + JSON.stringify(key), null);
            } else {
                callback(null, partitions);
            }
        }
    });
};

var runner = function (){

    var namespace='0';
    var partitionId='00';
    console.log("step 1");
    idBulkCreation(namespace, partitionId, function(err){
        console.log("step 2");
        if (err){
            console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " +  err);
        }
        partitionId='01';
        idBulkCreation(namespace, partitionId, function(err){
            if (err){
                console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " +  err);
            }
            partitionId='02';
            idBulkCreation(namespace, partitionId, function(err) {
                if (err) {
                    console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err);
                }
            });
        });
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

//setInterval(runner,86000000);
setTimeout(runner,5000);
