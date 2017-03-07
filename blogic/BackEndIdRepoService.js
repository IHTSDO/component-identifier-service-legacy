/**
 * Created by ar on 7/31/15.
 */

var sctid=require("../model/sctid");
var idDM = require("./../blogic/SCTIdBulkDataManager");
var sctIdHelper=require("../utils/SctIdHelper");
//var sIdDM = require("./../blogic/SchemeIdBulkDataManager");
//var stateMachine=require("../model/StateMachine");



var idBulkCreation = function (namespace, partitionId, callback){

    var query={partitionId:partitionId,namespace:namespace};
    sctid.count(query,function(err,recs){
        if (err==null) {
            var quant=100000-recs;
            if (quant>0) {
                var key = [parseInt(namespace), partitionId.toString()];

                getPartition(key, function (err, thisPartition) {
                    if (err) {
                        callback(err);
                    } else {
                        if (!data) {
                            callback("Partition not found for key:" + JSON.stringify(key));
                        }
                        var seq=thisPartition.sequence;
                        thisPartition.sequence = thisPartition.sequence + quant;
                        thisPartition.save(function (err) {
                            if (err) {
                                callback(err);
                            } else {

                                for (var i = 0; i < quant; i++) {
                                    Sync(function () {

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

                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });

};


var runner = function (){

    var namespace='0';
    var partitionId='00';
    idBulkCreation(namespace, partitionId, function(err){
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
