/**
 * Created by ar on 7/31/15.
 */


var dbInit=require("../config/dbInit");
var db;

function getModel(){
    if (!db){
        dbInit.getDBForDirect(function (err, pdb) {
            if (err) {
                throw err;
            }else {

                db = pdb;
            }
        })
    }
}

getModel();
var strErr="";
var strData="";
var strMsg="";
var step=0;

var cleanUpExpiredIds = function (callback){
    strErr="";
    strData="";
    strMsg="";
    var arrMsg=[];
    step=0;
    db.driver.execQuery("Update sctId set expirationDate=null,status='Available',software='Clean Service' where status='Reserved' and expirationDate<now()",null,
        function (err, data) {
            if (err) {
                var str="\n[Error] in clean up service - SctId expiration date: "+ JSON.stringify(err);
                console.log(str);
                if (callback){
                    strErr+= str;
                    step++;
                    if (step>1) {
                        strMsg=strErr + strData;
                        callback(strMsg, null);
                    }
                }
                return;
            }
            if (data) {
                data.model="SctId";
                var strD="\nSctId Expiration date clean up process:" + JSON.stringify(data);
                console.log(strD);
                if (callback){
                    strData+=strD;
                    arrMsg.push(data);
                    step++;
                    if (step>1) {
                        if (strErr=="") {
                            callback( null,arrMsg);
                        }else{
                            strMsg=strErr + strData;
                            callback(strMsg, null);
                        }
                    }
                }
                return;
            }
        });
    db.driver.execQuery("Update schemeId set expirationDate=null,status='Available',software='Clean Service' where status='Reserved' and expirationDate<now()",null,
        function (err, data) {
            if (err) {
                var str="\n[Error] in clean up service - SchemeId expiration date: "+ JSON.stringify(err);
                console.log(str);
                if (callback){
                    strErr+= str;
                    step++;
                    if (step>1) {
                        strMsg=strErr + strData;
                        callback(strMsg, null);
                    }
                }
                return;
            }
            if (data) {
                data.model="SchemeId";
                var strD="\nSchemeId Expiration date clean up process:" + JSON.stringify(data);
                console.log(strD);
                if (callback){
                    strData+=strD;
                    arrMsg.push(data);
                    step++;
                    if (step>1) {
                        if (strErr=="") {
                            callback( null,arrMsg);
                        }else{
                            strMsg=strErr + strData;
                            callback(strMsg, null);
                        }
                    }
                }
                return;
            }
        });
    //db.driver.execQuery("Delete from auxConcept where modified_at < (now() - interval 2 hour)",null,
    //    function (err, data) {
    //        if (err) {
    //            var str="\n[Error] in clean up auxConcept table : "+ JSON.stringify(err);
    //            console.log(str);
    //            if (callback){
    //                strErr+= str;
    //                step++;
    //                if (step>4) {
    //                    strMsg=strErr + strData;
    //                    callback(strMsg, null);
    //                }
    //            }
    //            return;
    //        }else{
    //            var strD="\nAuxConcept table clean up process:" + JSON.stringify(data);
    //            console.log(strD);
    //            if (callback){
    //                strData+=strD;
    //                arrMsg.push(data);
    //                step++;
    //                if (step>4) {
    //                    if (strErr=="") {
    //                        callback( null,arrMsg);
    //                    }else{
    //                        strMsg=strErr + strData;
    //                        callback(strMsg, null);
    //                    }
    //                }
    //            }
    //            return;
    //        }
    //    });
    //
    //db.driver.execQuery("Delete from auxDescription where modified_at < (now() - interval 2 hour)",null,
    //    function (err, data) {
    //        if (err) {
    //            var str="\n[Error] in clean up auxDescription table : "+ JSON.stringify(err);
    //            console.log(str);
    //            if (callback){
    //                strErr+= str;
    //                step++;
    //                if (step>4) {
    //                    strMsg=strErr + strData;
    //                    callback(strMsg, null);
    //                }
    //            }
    //            return;
    //        }else{
    //            var strD="\nauxDescription table clean up process:" + JSON.stringify(data);
    //            console.log(strD);
    //            if (callback){
    //                strData+=strD;
    //                arrMsg.push(data);
    //                step++;
    //                if (step>4) {
    //                    if (strErr=="") {
    //                        callback( null,arrMsg);
    //                    }else{
    //                        strMsg=strErr + strData;
    //                        callback(strMsg, null);
    //                    }
    //                }
    //            }
    //            return;
    //        }
    //    });
    //db.driver.execQuery("Delete from auxRelationship where modified_at < (now() - interval 2 hour)",null,
    //    function (err, data) {
    //        if (err) {
    //            var str="\n[Error] in clean up auxRelationship table : "+ JSON.stringify(err);
    //            console.log(str);
    //            if (callback){
    //                strErr+= str;
    //                step++;
    //                if (step>4) {
    //                    strMsg=strErr + strData;
    //                    callback(strMsg, null);
    //                }
    //            }
    //            return;
    //        }else{
    //            var strD="\nauxRelationship table clean up process:" + JSON.stringify(data);
    //            console.log(strD);
    //            if (callback){
    //                strData+=strD;
    //                arrMsg.push(data);
    //                step++;
    //                if (step>4) {
    //                    if (strErr=="") {
    //                        callback( null,arrMsg);
    //                    }else{
    //                        strMsg=strErr + strData;
    //                        callback(strMsg, null);
    //                    }
    //                }
    //            }
    //            return;
    //        }
    //    });
};

setInterval(cleanUpExpiredIds,86400000);

module.exports.cleanUpExpiredIds=cleanUpExpiredIds;

