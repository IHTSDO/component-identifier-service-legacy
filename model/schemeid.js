/**
 * Created by ar on 11/24/15.
 */
var db=require("../config/MysqlInit");

var schemeid={};

schemeid.findById=function(query,callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        var sql = "SELECT * FROM schemeId WHERE scheme=" + connection.escape(query.scheme) + " And schemeId = " + connection.escape(query.schemeId);
        connection.query(sql, function(error, rows)
        {
            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {
                if (rows && rows.length>0) {
                    callback(null, rows[0]);
                }else {
                    callback(null, null);
                }
            }
        });
    });
};

schemeid.findByIds=function(query,callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        var sql = "SELECT * FROM schemeId WHERE scheme=" + connection.escape(query.scheme) + " And schemeId in (" + connection.escape(query.schemeId) + ")" ;
        connection.query(sql,  function(error, rows)
        {
            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, rows);
            }
        });
    });
};
schemeid.findBySystemId=function(query,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;
        var sql = "SELECT * FROM schemeId WHERE scheme=" + connection.escape(query.scheme) + " And systemId = " + connection.escape(query.systemId) ;
        connection.query(sql, function(error, rows)
        {
            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {
                if (rows && rows.length>0) {
                    callback(null, rows);
                }else{
                    callback(null, null);
                }
            }
        });
    });
};
schemeid.findBySystemIds=function(query,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;

        var sql = "SELECT * FROM schemeId WHERE scheme=" + connection.escape(query.scheme) + " And systemId in (" + connection.escape(query.systemId) + ")";
        connection.query(sql, function(error, rows)
        {

            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {

                callback(null, rows);
            }
        });
    });
};

schemeid.findByJobId=function(query,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;

        var sql = "SELECT * FROM schemeId WHERE jobId = " + connection.escape(query.jobId) + " UNION SELECT * FROM schemeId_log WHERE jobId =  " + connection.escape(query.jobId);
        connection.query(sql, function(error, rows)
        {

            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {
                var cleanRows = [];
                var ids = [];
                rows.each(function(row) {
                    if (ids.indexOf(row.systemId) == -1) {
                        cleanRows.push(row);
                        ids.push(row.systemId);
                    }
                });
                callback(null, cleanRows);
            }
        });
    });
};

schemeid.find=function(query, limit, skip, callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        var swhere="";
        for (var field in query) {
            if (query.hasOwnProperty(field)) {

                swhere += " And " + field + "=" + connection.escape(query[field]) ;
            }
        }
        if (swhere!=""){
            swhere = " WHERE " + swhere.substr(5);
        }
        var sql;
        if (limit && limit>0 && (!skip || skip==0)) {
            sql = "SELECT * FROM schemeId" + swhere + " order by schemeId limit " + limit;
        }else{
            sql = "SELECT * FROM schemeId" + swhere + " order by schemeId";
        }
        connection.query(sql, function(error, rows)
        {
            connection.release();
            if(error)
            {
                callback(error, null);
            }
            else
            {
                if ((!skip || skip==0)) {
                    callback(null, rows);
                }else {
                    var cont = 1;
                    var newRows = [];
                    for (var i = 0; i < rows.length; i++) {
                        if (i >= skip) {
                            if (limit && limit > 0 && limit < cont) {
                                break;
                            }
                            newRows.push(rows[i]);
                            cont++;
                        }
                    }
                    callback(null, newRows);
                }
            }
        });
    });
};

 schemeid.save=function(schemeIdRecord,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;

        var supdate="";
        for (var field in schemeIdRecord) {
            if (schemeIdRecord.hasOwnProperty(field)) {
                if (field!="schemeId" && field!="scheme") {
                    supdate += " ," + field + "=" + connection.escape(schemeIdRecord[field]) ;
                }
            }
        }
        if (supdate!="") {
            supdate = supdate.substr(2);
            connection.query("UPDATE schemeId SET " + supdate + " ,modified_at=now() WHERE scheme=" + connection.escape(schemeIdRecord.scheme) + " And schemeId=" + connection.escape(schemeIdRecord.schemeId), function (error, result) {
                connection.release();
                if (error) {
                    callback (error,null);
                }
                else {

                    callback(null, schemeIdRecord);
                }
            });
        }else{
            callback(null, schemeIdRecord);
        }
    });
};

schemeid.create=function(schemeIdRecord,callback){

    db.getDB(function (err,connection)
    {

        if (err) throw err;
        schemeIdRecord.created_at=new Date();
        connection.query('INSERT INTO schemeId SET ?', schemeIdRecord, function(error, result)
        {
            connection.release();
            if(error)
            {
                callback (error,null);
            }
            else
            {

                callback(null, schemeIdRecord);
            }
        });
    });
};

module.exports=schemeid;