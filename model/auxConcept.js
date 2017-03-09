/**
 * Created by ar on 11/24/15.
 */
var db=require("../config/MysqlInit");

var auxConcept={};

auxConcept.create=function(sctIdRecord,callback){

    db.getDB(function (err,connection)
    {

        if (err) throw err;
        connection.query('INSERT INTO auxConcept SET ?', sctIdRecord, function(error, result)
        {
            connection.release();
            if(error)
            {
                callback (error,null);
            }
            else
            {

                callback(null, sctIdRecord);
            }
        });
    });
};

auxConcept.availableCount=function(query,callback){

    db.getDB(function (err,connection)
    {
        if (err) throw err;

        var sql;
        sql = "SELECT count(*) as count FROM auxConcept where modified_at is null" ;
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
                    callback(null, rows[0].count);
                }else{
                    callback(null, 0);
                }
            }
        });
    });
};
module.exports=auxConcept;