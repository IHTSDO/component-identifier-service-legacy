/**
 * Created by ar on 11/24/15.
 */
var db=require("../config/MysqlInit");

var job={};
job.findById=function(query,callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        var sql = "SELECT * FROM bulkJob WHERE id = " + connection.escape(query.id);
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


job.find=function(query, limit, skip, callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        if (!query){
            query={};
        }
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
            sql = "SELECT * FROM bulkJob" + swhere + " order by id limit " + limit;
        }else{
            sql = "SELECT * FROM bulkJob" + swhere + " order by id";
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

job.findFieldSelect=function(query, fields,limit, skip,orderBy, callback){
    db.getDB(function (err,connection)
    {
        if (err) throw err;
        if (!query){
            query={};
        }
        var swhere="";
        for (var field in query) {
            if (query.hasOwnProperty(field)) {

                swhere += " And " + field + "=" + connection.escape(query[field]) ;
            }
        }
        if (swhere!=""){
            swhere = " WHERE " + swhere.substr(5);
        }
        var select="";
        if (fields) {
            for (var field in fields) {
                if (fields.hasOwnProperty(field)) {

                    select += "," + field;
                }
            }
        }
        if (select!=""){
            select =  select.substr(1);
        }else{
            select ="*"
        }
        var dataOrder="";
        if (orderBy) {
            for (var field in orderBy) {
                if (orderBy.hasOwnProperty(field)) {

                    dataOrder += "," + field;
                    if (orderBy[field]=="D"){
                        dataOrder += " desc" ;
                    }

                }
            }
        }
        if (dataOrder!=""){
            dataOrder =  dataOrder.substr(1);
        }else{
            dataOrder ="id";
        }
        var sql;
        if (limit && limit>0 && (!skip || skip==0)) {
            sql = "SELECT " + select + " FROM bulkJob" + swhere + " order by " + dataOrder + " limit " + limit;
        }else{
            sql = "SELECT " + select + " FROM bulkJob" + swhere + " order by " + dataOrder ;
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

job.save=function(jobRecord,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;

        var supdate="";
        for (var field in jobRecord) {
            if (jobRecord.hasOwnProperty(field)) {
                if (field!="id") {
                    supdate += " ," + field + "=" + connection.escape(jobRecord[field]) ;
                }
            }
        }
        if (supdate!="") {
            supdate = supdate.substr(2);
            connection.query("UPDATE bulkJob SET " + supdate + " ,modified_at=now() WHERE id=" + jobRecord.id, function (error, result) {
                connection.release();
                if (error) {
                    callback (error,null);
                }
                else {

                    callback(null, jobRecord);
                }
            });
        }else{
            callback(null, jobRecord);
        }
    });
};

job.create=function(jobRecord,callback){

    db.getDB(function (err,connection)
    {

        if (err) throw err;
        jobRecord.created_at=new Date();
        var newJobRec={
            id:jobRecord.id,
            name:jobRecord.name,
            status:jobRecord.status,
            request:JSON.stringify(jobRecord.request),
            created_at:jobRecord.created_at
        };
        connection.query('INSERT INTO bulkJob SET ?', newJobRec, function(error, result)
        {
            connection.release();
            if(error)
            {
                callback (error,null);
            }
            else
            {
                jobRecord.id=result.insertId;
                callback(null, jobRecord);
            }
        });
    });
};

module.exports=job;