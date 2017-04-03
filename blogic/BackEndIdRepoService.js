/**
 * Created by ar on 7/31/15.
 */

var idRepo = require("./../blogic/IdReposition");
var auxConcept=require("../model/auxConcept");
var auxDescription=require("../model/auxDescription");
var auxRelationship=require("../model/auxRelationship");
var namespaceDm = require("../blogic/NamespaceDataManager");

var idTotal=100000;

var runner = function (){
    namespaceDm.getNamespaces(function(err, namespaces) {
        if (err) {
            console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err);
            return;
        }
        if (namespaces) {

            namespaces.forEach(function (namespaceRecord) {
                if (namespaceRecord.idPregenerate && namespaceRecord.idPregenerate == "1") {
                    console.log("Ids pregeneration for namespaceId " + namespaceRecord.namespace);
                    var namespace = namespaceRecord.namespace.toString();
                    var preffPartition="0";
                    if (namespace!="0"){
                        preffPartition="1";
                    }
                    var partitionId = preffPartition + "0";
                    idRepo.idBulkCreation(auxConcept, namespace, partitionId, idTotal, function (err) {
                        if (err) {
                            console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err);
                        }
                        partitionId = preffPartition + "1";
                        idRepo.idBulkCreation(auxDescription, namespace, partitionId, idTotal, function (err) {
                            if (err) {
                                console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err);
                            }
                            partitionId = preffPartition + "2";
                            idRepo.idBulkCreation(auxRelationship, namespace, partitionId, idTotal, function (err) {
                                if (err) {
                                    console.log("[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err);
                                }
                            });
                        });
                    });
                }
            });
        }
    });
};

runner();

setInterval(runner,36000000);
