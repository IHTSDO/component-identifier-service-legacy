/**
 * Created by ar on 7/16/15.
 */

var dbuser = "root";
var dbpass = "";

process.argv.forEach(function (val, index, array) {
    //console.log(index + ': ' + val);
    var parts = val.split("=");
    if (parts[0] == "dbuser") {
        dbuser = parts[1];
    } else if (parts[0] == "dbpass") {
        dbpass = parts[1];
    }
});

var database={
    connectionURL:"mysql://" + dbuser + ":" + dbpass + "@localhost/idservice"
};
module.exports.database=database;