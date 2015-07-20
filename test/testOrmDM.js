/**
 * Created by ar on 7/17/15.
 */

var dbInit=require("../config/dbInit");
var ormDM=require("../blogic/SCTIdDataManager");
dbInit.getDB(function(err,db,model) {
    if (err) throw err;
    var nameTest=2222222;
    model.namespaceTable.get([nameTest,"00"],function(err,namespaces) {

        if (namespaces){
            console.log("removing namespace:" + namespaces.namespace);
            namespaces.remove(function(err){
                if (err) throw err;
                model.sctIdTable.find({"namespace": nameTest, "partitionId": "00"}).remove(function(err){
                    if (err) throw err;
                    //process.exit(code=0);
                })
            })
        }
        model.namespaceTable.create({"namespace": nameTest, "partitionId": "00", "sequence": 1}, function (err) {
            console.log("creating namespace: 0" );
            if (err) throw  err;
            var operation = {
                "action": "reserve",
                "namespace": nameTest,
                "partitionId": "00",
                "author":"arodriguez",
                "systemId": "TS-web",
                "software": "editionTerm",
                "expirationDate": "20991231",
                "comment": "A comment about the action"
            };
            console.log("To Reserved sctidRec:");
            ormDM.sctIdReserve(operation, function (err, sctidRec) {
                if (err) throw err;
                console.log("From Reserved sctidRec:");
                console.log("Reserved sctidRec:" + JSON.stringify(sctidRec));
               operation.sctid=sctidRec.sctid;
               ormDM.sctIdUpdate(operation, "free", function (err, sctidRec) {
                   if (err) throw err;
                    console.log("Available sctidRec:" + JSON.stringify(sctidRec));

                    ormDM.sctIdUpdate(operation, "assigned", function (err, sctidRec) {
                        if (err) throw err;
                        console.log("Assigned sctidRec:" + JSON.stringify(sctidRec));

                        ormDM.sctIdGenerate(operation, function (err, sctidRec) {
                            if (err) throw err;
                            console.log("Generated sctidRec:" + JSON.stringify(sctidRec));
                            process.exit(code=0);
                        })
                    })
               })
            });
        });


    });
});