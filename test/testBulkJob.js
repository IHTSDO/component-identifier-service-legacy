/**
 * Created by ar on 7/30/15.
 */


var dbInit=require("../config/dbInit");
dbInit.getDB(function(err,db,model) {

    model.bulkJob.create({})
}