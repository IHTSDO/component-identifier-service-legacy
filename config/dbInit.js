/**
 * Created by ar on 7/16/15.
 */
/**
 * Created by ar on 7/16/15.
 */
var orm = require("orm");
var modts = require('orm-timestamps');
var params=require("../config/params");
var dbmodel=require("../model/dbmodel");
var gModel;
var gdb;
var dbDefine=function(db, callback ){

    try {
        db.use(modts, dbmodel.mUse);

        var model = dbmodel.model;
        for (var table in dbmodel.model) {
//            console.log("table:" + table);
            if (dbmodel.model.hasOwnProperty(table)) {
                if (dbmodel.model[table].features) {
                    var record = db.define(dbmodel.model[table].name,
                        dbmodel.model[table].fields,
                        dbmodel.model[table].features
                    );
                }else{

                    var record = db.define(dbmodel.model[table].name,
                        dbmodel.model[table].fields
                    );
                }
//                console.log("table in model:" + table);
                model[table] = record;
            }
        }
        callback(null,db, model);
    }catch(e){
        callback(e,null,null);
    }
};

var dbTablesCreate=function (callback ) {
    orm.connect(params.database.connectionURL, function (err, db) {
        if (err) throw err;

        dbDefine(db, function (err, dbr,model) {
            if (err) throw err;
            // add the table to the database

            dbr.sync(function (err) {
                if (err) throw err;

                if (callback) {
                    callback(dbr);
                }
            });
        });

    });
};

var getDB=function (callback ) {
    orm.connect(params.database.connectionURL, function (err, db) {
        if (err) {
            callback(err, null, null);
        }
        if (gModel){
           console.log("Usign model from cache");
            callback(null, gdb, gModel);
        }else {
            dbDefine(db, function (err, dbr, model) {

                if (err) {
                    callback(err, null, null);
                } else {
                    //dbr.sync(function (err) {
                    //    if (err) throw err;

                   console.log("Initializing model");
                        gModel = model;
                        gdb = dbr;
                        callback(null, dbr, model);
                    //});
                }
            });
        }

    });
};

//dbTablesCreate(function(){
//    process.exit(code = 0);
//});

/*
ALTER TABLE `test`.`sctId`
CHANGE COLUMN `sequence` `sequence` BIGINT(18) NULL DEFAULT NULL ;
*/
module.exports.dbDefine=dbDefine;
module.exports.dbTablesCreate=dbTablesCreate;
module.exports.getDB=getDB;