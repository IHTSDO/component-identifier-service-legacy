/**
 * Created by ar on 11/24/15.
 */
var params=require("../config/params");
var mysql     =    require('mysql');
var pool      =    mysql.createPool({
    connectionLimit : 100,
    host     : params.database.host,
    user     : params.database.user,
    password : params.database.pass,
    database : params.database.dbname,
    debug    :  false
});

var getDB=function (callback ) {

    console.log( "mysqlInit: dbuser:" + params.database.user ) ;
    console.log( "mysqlInit: pass:" + params.database.pass ) ;

    pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            if (err) throw err;
            return;
        }
        callback(null,connection);
    });
};
module.exports.getDB=getDB;
