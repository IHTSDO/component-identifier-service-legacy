/**
 * Created by alo on 7/28/15.
 */
var dbInit=require("../config/dbInit");

dbInit.dbTablesCreate(function(){
    process.exit(code = 0);
});