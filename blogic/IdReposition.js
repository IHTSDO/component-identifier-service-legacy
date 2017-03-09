/**
 * Created by ar on 7/31/15.
 */

var sctid=require("../model/sctid");
var idDM = require("./../blogic/SCTIdBulkDataManager");
var sctIdHelper=require("../utils/SctIdHelper");
var Sync = require('sync');


var idBulkCreation = function (auxTable, namespace, partitionId, idsTotal, callback){

    var t1=new Date().getTime();
    console.log("step 11");
    var query={partitionId:partitionId,namespace:namespace, modified_at:null};
    auxTable.availableCount(query,function(err,recs){
        console.log("step 12");
        if (err==null) {
            var quant=idsTotal-recs;
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
                                                        idDM.insertAssignedRecord.sync(null, SCTId, systemId);

                                                        var auxRecord={sctid:SCTId, partitionId:partitionId, namespace:namespace, modified_at: null};
                                                        auxTable.create.sync(null, auxRecord);
                                                    }
                                                } catch (e) {
                                                    callback(e);
                                                }

                                            }

                                            if (count>=quant){
                                                var t2 = new Date().getTime();
                                                console.log("Final took: " + (t2 - t1) + " milisecs");
                                                callback(null);
                                            }
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


module.exports.idBulkCreation=idBulkCreation;