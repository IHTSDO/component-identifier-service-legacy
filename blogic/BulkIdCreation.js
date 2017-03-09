/**
 * Created by ar on 3/8/17.
 */


var idRepo = require("./../blogic/IdReposition");;
var auxConcept=require("../model/auxConcept");
//var auxDescription=require("../model/auxDescription");
//var auxRelationship=require("../model/auxRelationship");


var db=require("../config/MysqlInit");


var conceptIdBulkCreation = function (namespace, partitionId, idsTotal, callback) {

    var t1 = new Date().getTime();
    console.log("step 11");

    testQuantity(auxConcept, namespace, partitionId, idsTotal, function (err) {

        if (err) {
            callback(err,null);
        }else{

            db.getDB(function (err,connection)
            {

                var modified_at=new Date();
                var sql="UPDATE auxConcept SET modified_at='" + modified_at + "'  where modified_at is null limit " + idsTotal;
                connection.query(sql, function (error, result) {
                    connection.release();
                    if (error) {
                        callback (error,null);
                    }
                    else {
                        sql="SELECT sctid from auxConcept where modified_at='" + modified_at + "' limit " + idsTotal;
                        connection.query(sql, function (error, result) {
                            connection.release();
                            if (error) {
                                callback(error, null);
                            }
                            else {

                                callback(null, result);
                            }
                        });
                    }
                });
            });


        }


    });
};


var testQuantity = function (auxTable, namespace, partitionId, idsTotal, callback) {
    var query = {partitionId: partitionId, namespace: namespace, modified_at: null};


    auxTable.availableCount(query, function (err, recs) {
        console.log("step 12");
        if (err == null) {
            var quant = idsTotal - recs;
            console.log("step testing quantity - quant=" + quant);
            if (quant > 0) {
                console.log("need to create ids, total=" + idsTotal);
                idRepo.idBulkCreation(auxTable, namespace, partitionId, idsTotal, function (err) {
                    console.log("created ids, total availables=" + idsTotal);
                    if (err) {
                        var str = "[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err;
                        console.log(str);
                        callback(str);
                    } else {
                        callback(null);
                    }
                });

            } else {
                callback(null);
            }


        }
    });
};

conceptIdBulkCreation( 0, "00", 100000, function(err, result){
    if (err){
        console.log("error: " + err);
    }else{

        if (result){
            if (result.length){

                console.log("result length:" + result.length);
            }else{
                console.log("There is not an array");
            }
        }else{
            console.log("Result is null");

        }
    }
})