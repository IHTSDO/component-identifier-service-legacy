/**
 * Created by ar on 3/8/17.
 */


var idRepo = require("./../blogic/IdReposition");;
var auxConcept=require("../model/auxConcept");
var auxDescription=require("../model/auxDescription");
var auxRelationship=require("../model/auxRelationship");


var db=require("../config/MysqlInit");


var conceptIdBulkCreation = function (namespace, partitionId, idsTotal, request, callback) {


    console.log("step conceptIdBulkCreation");

    testQuantity(auxConcept, namespace, partitionId, idsTotal, function (err) {

        var t2 = new Date().getTime();
        //console.log("Partial call to testing space ids took: " + (t2 - t1) + " milisecs");
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
                            var t5 = new Date().getTime();
                            console.log("Partial call to select data took: " + (t5 - t4) + " milisecs");
                            if (error) {
                                callback(error, null);
                            }
                            else {

                                if (request) {

                                    callback(null, result);

                                    sql = "update sctId s inner join auxConcept c on c.sctid=s.sctId set s.author= " + connection.escape(request.author) +
                                        ",s.software= " + connection.escape(request.software) +
                                        ",s.comment= " + connection.escape(request.comment) +
                                        ",s.jobId= " + connection.escape(request.jobId) +
                                        " where c.modified_at=" + connection.escape(modified_at)  ;

                                    connection.query(sql, function (error, result) {

                                        sql = "Delete from auxConcept where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                        connection.query(sql, function (error, result) {
                                            connection.release();
                                        });
                                    });

                                }else{
                                    sql = "Delete from auxConcept where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                    connection.query(sql, function (error, result) {
                                        connection.release();
                                        idRepo.idBulkCreation(auxDescription, namespace, partitionId, idsTotal, function (err) {
                                            console.log("created ids, total availables=" + idsTotal);
                                            if (err) {
                                                var str = "[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err;
                                                console.log(str);
                                            }
                                        });
                                    });
                                }
                            }
                        });
                    }
                });
            });


        }


    });
};

var descriptionIdBulkCreation = function (namespace, partitionId, idsTotal, request, callback) {


    console.log("step descriptionIdBulkCreation");

    testQuantity(auxDescription, namespace, partitionId, idsTotal, function (err) {

        var t2 = new Date().getTime();
        //console.log("Partial call to testing space ids took: " + (t2 - t1) + " milisecs");
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
                var sql="UPDATE auxDescription SET modified_at=" + connection.escape(modified_at) + "  where modified_at is null limit " + idsTotal;
                connection.query(sql, function (error, result) {
                    //connection.release();
                    var t4 = new Date().getTime();
                    console.log("Partial call to update data took: " + (t4 - t3) + " milisecs");
                    if (error) {
                        callback (error,null);
                    }
                    else {
                        sql="SELECT sctid from auxDescription where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                        connection.query(sql, function (error, result) {
                            var t5 = new Date().getTime();
                            console.log("Partial call to select data took: " + (t5 - t4) + " milisecs");
                            if (error) {
                                callback(error, null);
                            }
                            else {


                                if (request) {

                                    callback(null, result);

                                    sql = "update sctId s inner join auxDescription c on c.sctid=s.sctId set s.author= " + connection.escape(request.author) +
                                        ",s.software= " + connection.escape(request.software) +
                                        ",s.comment= " + connection.escape(request.comment) +
                                        ",s.jobId= " + connection.escape(request.jobId) +
                                        " where c.modified_at=" + connection.escape(modified_at)  ;

                                    connection.query(sql, function (error, result) {

                                        sql = "Delete from auxDescription where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                        connection.query(sql, function (error, result) {
                                            connection.release();
                                            idRepo.idBulkCreation(auxDescription, namespace, partitionId, idsTotal, function (err) {
                                                console.log("created ids, total availables=" + idsTotal);
                                                if (err) {
                                                    var str = "[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err;
                                                    console.log(str);
                                                }
                                            });
                                        });
                                    });

                                }else{
                                    sql = "Delete from auxDescription where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                    connection.query(sql, function (error, result) {
                                        connection.release();
                                    });
                                }
                            }
                        });
                    }
                });
            });


        }


    });
};
var relationshipIdBulkCreation = function (namespace, partitionId, idsTotal, request, callback) {


    console.log("step relationshipIdBulkCreation");

    testQuantity(auxRelationship, namespace, partitionId, idsTotal, function (err) {

        var t2 = new Date().getTime();
        //console.log("Partial call to testing space ids took: " + (t2 - t1) + " milisecs");
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
                var sql="UPDATE auxRelationship SET modified_at=" + connection.escape(modified_at) + "  where modified_at is null limit " + idsTotal;
                connection.query(sql, function (error, result) {
                    //connection.release();
                    var t4 = new Date().getTime();
                    console.log("Partial call to update data took: " + (t4 - t3) + " milisecs");
                    if (error) {
                        callback (error,null);
                    }
                    else {
                        sql="SELECT sctid from auxRelationship where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                        connection.query(sql, function (error, result) {
                            var t5 = new Date().getTime();
                            console.log("Partial call to select data took: " + (t5 - t4) + " milisecs");
                            if (error) {
                                callback(error, null);
                            }
                            else {

                                if (request) {

                                    callback(null, result);

                                    sql = "update sctId s inner join auxRelationship c on c.sctid=s.sctId set s.author= " + connection.escape(request.author) +
                                        ",s.software= " + connection.escape(request.software) +
                                        ",s.comment= " + connection.escape(request.comment) +
                                        ",s.jobId= " + connection.escape(request.jobId) +
                                        " where c.modified_at=" + connection.escape(modified_at)  ;

                                    connection.query(sql, function (error, result) {

                                        sql = "Delete from auxRelationship where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                        connection.query(sql, function (error, result) {
                                            connection.release();
                                            idRepo.idBulkCreation(auxRelationship, namespace, partitionId, idsTotal, function (err) {
                                                console.log("created ids, total availables=" + idsTotal);
                                                if (err) {
                                                    var str = "[ERROR] " + (new Date()).getTime() + ": namespace=" + namespace + ", partition=" + partitionId + ". " + err;
                                                    console.log(str);
                                                }
                                            });
                                        });
                                    });

                                }else{
                                    sql = "Delete from auxRelationship where modified_at=" + connection.escape(modified_at) + " limit " + idsTotal;
                                    connection.query(sql, function (error, result) {
                                        connection.release();
                                    });
                                }
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
            console.log("step testing quantity in aux table, required - existent: " + quant);
            if (quant > 0) {
                callback("It is necesary wait for ids reposition. Try again in few minutes");
                createIds(auxTable, namespace, partitionId, idsTotal,function(err) {
                    if (err){
                        console.log("Cannot create ids:" + err);
                    }
                });
            } else {
                callback(null);
            }


        }
    });
};
var createIds = function (auxTable, namespace, partitionId, idsTotal, callback) {
    var query = {partitionId: partitionId, namespace: namespace, modified_at: null};


    auxTable.availableCount(query, function (err, recs) {
        console.log("step 12");
        if (err == null) {
            var quant = idsTotal - recs;
            console.log("step create Ids, checking quantity" );
            if (quant > 0) {
                console.log("need to create " + quant + " ids, up to " + idsTotal);
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
                console.log("ids quantity in aux table is ok");
                callback(null);
            }


        }
    });
};

var createAvailableIds = function (request, callback) {
    var t1 = new Date().getTime();
    var auxTable;
    if (request.partitionId.substr(1,1)=="0") {
        auxTable = auxConcept;
    }else if (request.partitionId.substr(1,1)=="1"){
        auxTable = auxDescription;
    }else if (request.partitionId.substr(1,1)=="2") {
        auxTable = auxRelationship;
    }
    createIds(auxTable, request.namespace, request.partitionId, request.quantity,function (err) {

        var t2 = new Date().getTime();
        console.log("Partial call to testing available ids took: " + (t2 - t1) + " milisecs");
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

var idsRetrieve = function (request, callback) {

    if (request.partitionId.substr(1,1)=="0") {
        conceptIdBulkCreation( request.namespace, request.partitionId, request.quantity, request, function(err, result){

            if (err) {
                callback(err,null);
            } else {
                callback(null,result);
            }
        });
    }else if (request.partitionId.substr(1,1)=="1") {
        descriptionIdBulkCreation(request.namespace, request.partitionId, request.quantity, request, function (err, result) {

            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }else if (request.partitionId.substr(1,1)=="2") {
        relationshipIdBulkCreation( request.namespace, request.partitionId, request.quantity, request, function(err, result){

            if (err) {
                callback(err,null);
            } else {
                callback(null,result);
            }
        });
    }

};

module.exports.createAvailableIds=createAvailableIds;
module.exports.testQuantity=testQuantity;
module.exports.conceptIdBulkCreation=conceptIdBulkCreation;
module.exports.descriptionIdBulkCreation=descriptionIdBulkCreation;
module.exports.relationshipIdBulkCreation=relationshipIdBulkCreation;
module.exports.idsRetrieve=idsRetrieve;

//var t1 = new Date().getTime();
//
//conceptIdBulkCreation( 0, "00", 100000, function(err, result){
//    if (err){
//        console.log("error: " + err);
//    }else{
//
//        if (result){
//            if (result.length){
//
//                console.log("result length:" + result.length);
//            }else{
//                console.log("There is not an array");
//            }
//        }else{
//            console.log("Result is null");
//
//        }
//    }
//        var t2 = new Date().getTime();
//        console.log("Final call to retrieve ids took: " + (t2 - t1) + " milisecs");
//});