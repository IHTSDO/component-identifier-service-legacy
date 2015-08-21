/**
 * Created by ar on 7/31/15.
 */


var dbInit=require("../config/dbInit");
var db;
var model;

function getModel(){
    if (!model){
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                throw err;
            }else {

                db = pdb;
                model = podel1;
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
};

setInterval(cleanUpExpiredIds,86400000);

module.exports.cleanUpExpiredIds=cleanUpExpiredIds;

