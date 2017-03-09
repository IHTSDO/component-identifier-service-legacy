/**
 * Created by ar on 3/8/17.
 */


var idRepo = require("./../blogic/IdReposition");;
var auxConcept=require("../model/auxConcept");
//var auxDescription=require("../model/auxDescription");
//var auxRelationship=require("../model/auxRelationship");


var db=require("../config/MysqlInit");


var conceptIdBulkCreation = function (namespace, partitionId, idsTotal, callback) {


    console.log("step conceptIdBulkCreation");

    testQuantity(auxConcept, namespace, partitionId, idsTotal, function (err) {

        var t2 = new Date().getTime();
        console.log("Partial call to testing space ids took: " + (t2 - t1) + " milisecs");
        if (err) {
            callback(err,null);
        }else{

            db.getDB(function (err,connection)
            {
                var t3 = new Date().getTime();
                console.log("Partial call to get db connection took: " + (t3 - t2) + " milisecs");
                var now = new Date();
                var jsonDate = now.toJSON();
                var modified_at = new Date(jsonDate);

                console.log("modified_at:" + connection.escape(modified_at));
                var sql="UPDATE auxConcept SET modified_at=" + connection.escape(modified_at) + "  where modified_at is null limit " + idsTotal;
                connection.query(sql, function (error, result) {
                    //connection.release();
                    var t4 = new Date().getTime();
                    console.log("Partial call to update data took: " + (t4 - t3) + " milisecs");
                    if (error) {
                        callback (error,null);
                    }
                    else {
                        sql="SELECT sctid from auxConcept where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                        connection.query(sql, function (error, result) {
                            connection.release();
                            var t5 = new Date().getTime();
                            console.log("Partial call to select data took: " + (t5 - t4) + " milisecs");
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
var t1 = new Date().getTime();

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
        var t2 = new Date().getTime();
        console.log("Final call to retrieve ids took: " + (t2 - t1) + " milisecs");
});