/**
 * Created by ar on 7/16/15.
 */
var dbInit=require("../config/dbInit");
var stateMachine=require("../model/StateMachine");
var schemeid =require("../model/schemeid");
var model;
var fs = require('fs');
var path=require('path');
var schemes=[];
var generators_path = __dirname + '/SchemeIdGenerator';

fs.readdirSync(generators_path).forEach(function (file) {
    if (~file.indexOf('.js')) {
        var schemeName=path.basename(file, '.js');
        schemes[schemeName.toUpperCase()]=require(generators_path + '/' + file)
    }
});

function getModel(callback){
    if (model){
        callback(null);
    }else {
        dbInit.getDB(function (err, pdb, podel1) {
            if (err) {
                callback(err);
            }else {

                model = podel1;
                callback(null);
            }
        })
    }
}

var throwErrMessage=function(msg){
    var err={};
    err.message=msg;
    return err;
};

var getSchemeId=function (scheme,schemeId, callback){
    if (schemeId==null || schemeId==""){
        callback(throwErrMessage("Not valid schemeId."),null);
        return;
    }else{

        if (!schemes[scheme.toUpperCase()].validSchemeId(schemeId)){

            callback(throwErrMessage("Not valid schemeId."),null);
            return;
        }
    }
    var objQuery={scheme: scheme.toUpperCase(),schemeId: schemeId};
            schemeid.findById(objQuery, function (err, schemeIdRecord) {
                if (err) {
                    callback(err, null);
                }else {
                    if (!schemeIdRecord) {
                        getFreeRecord(scheme, schemeId, function (err, record) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, record);
                            }
                        });
                    } else {
                        callback(null, schemeIdRecord);
                    }
                }
            });
};

var getSchemeIds=function (query, limit, skip, callback) {
    var objQuery = {};
    var limitR = 100;
    var skipTo = 0;
    if (limit)
        limitR = limit;
    if (skip)
        skipTo = skip;
    if (query)
        objQuery = query;
    schemeid.find(objQuery, limitR, skipTo, function (err, schemeids) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, schemeids);
        }
    });
};

function getFreeRecord(scheme, schemeId, callback){
    var schemeIdRecord= getNewRecord(scheme, schemeId);
    schemeIdRecord.status= stateMachine.statuses.available;
    insertSchemeIdRecord(schemeIdRecord,function(err,newRecord){
        if (err){
            callback(err,null);
        }else{
            callback(null,newRecord);
        }

    });
}
function getNewRecord(scheme, schemeId){
    var schemeIdRecord= {
        scheme: scheme.toUpperCase(),
        schemeId: schemeId,
        sequence: schemes[scheme.toUpperCase()].getSequence( schemeId),
        checkDigit: schemes[scheme.toUpperCase()].getCheckDigit( schemeId),
        systemId:guid()
    };
    return schemeIdRecord;
}

var getSchemeIdBySystemId=function (scheme, systemId, callback) {
    var objQuery = {scheme: scheme.toUpperCase(), systemId: systemId};
    schemeid.findBySystemId(objQuery, function (err, schemeIdRecords) {
        if (err) {
            callback(err, null);
        } else {
            if (schemeIdRecords && schemeIdRecords.length > 0) {
                callback(null, schemeIdRecords[0]);
            } else {
                callback(null, null);
            }
        }

    });
};

var generateSchemeId=function (scheme, operation, callback) {
    if (!operation.autoSysId) {
        getSchemeIdBySystemId(scheme, operation.systemId, function (err, schemeId) {
            if (err) {
                callback(err, null);
            } else if (schemeId) {

                callback(null, schemeId);
            } else {

                setNewSchemeIdRecord(scheme, operation, stateMachine.actions.generate, function (err, schemeIdRecord) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, schemeIdRecord);
                    }
                });
            }
        });
    } else {
        setNewSchemeIdRecord(scheme, operation, stateMachine.actions.generate, function (err, schemeIdRecord) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, schemeIdRecord);
            }
        });

    }
};

var reserveSchemeId=function (scheme, operation, callback) {
    setNewSchemeIdRecord(scheme, operation, stateMachine.actions.reserve, function (err, schemeIdRecord) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, schemeIdRecord);
        }
    });
};

function registerNewSchemeId(scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);

        }else {

            var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, stateMachine.actions.register);
            if (newStatus) {

                if (operation.systemId && operation.systemId.trim() != "") {
                    schemeIdRecord.systemId = operation.systemId;
                }
                schemeIdRecord.status = newStatus;
                schemeIdRecord.author = operation.author;
                schemeIdRecord.software = operation.software;
                schemeIdRecord.expirationDate = operation.expirationDate;
                schemeIdRecord.comment = operation.comment;
                schemeIdRecord.jobId = null;
                updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot register SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
            }
        }
    });
};


var registerSchemeId=function (scheme, operation, callback){

    if (!operation.autoSysId) {
        getSchemeIdBySystemId(scheme, operation.systemId, function (err, schemeId) {
            if (err) {
                callback(err, null);
            } else if (schemeId) {
                if (schemeId.schemeId != operation.schemeId) {
                    callback(throwErrMessage("SystemId:" + operation.systemId + " already exists with SchemeId:" + schemeId.schemeId), null);
                    return;
                }

                if (schemeId.status==stateMachine.statuses.assigned) {
                    callback(null, schemeId);
                }else {
                    registerNewSchemeId(scheme, operation, function (err, newSchemeId) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, newSchemeId);
                        }
                    });
                }
            } else {
                registerNewSchemeId(scheme, operation, function (err, newSchemeId) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, newSchemeId);
                    }
                });
            }
        });
    } else {
        registerNewSchemeId(scheme, operation, function (err, newSchemeId) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, newSchemeId);
            }
        });

    }
};


var deprecateSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);
        }else {

            var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, stateMachine.actions.deprecate);
            if (newStatus) {

                schemeIdRecord.status = newStatus;
                schemeIdRecord.author = operation.author;
                schemeIdRecord.software = operation.software;
                schemeIdRecord.comment = operation.comment;
                schemeIdRecord.jobId = null;
                updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot deprecate SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
            }
        }
    });
};

var releaseSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord){

        if (err) {
            callback(err, null);
        }else {

            var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, stateMachine.actions.release);
            if (newStatus) {

                schemeIdRecord.status = newStatus;
                schemeIdRecord.author = operation.author;
                schemeIdRecord.software = operation.software;
                schemeIdRecord.comment = operation.comment;
                schemeIdRecord.jobId = null;
                updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot release SchemeId:" + operation.schemeId + ", current status:" + schemeIdRecord.status), null);
            }
        }
    });
};

var publishSchemeId=function (scheme, operation, callback){
    getSchemeId(scheme, operation.schemeId,function(err,schemeIdRecord) {

        if (err) {
            callback(err, null);
        }else {

            var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, stateMachine.actions.publish);
            if (newStatus) {

                schemeIdRecord.status = newStatus;
                schemeIdRecord.author = operation.author;
                schemeIdRecord.software = operation.software;
                schemeIdRecord.comment = operation.comment;
                schemeIdRecord.jobId = null;
                updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    }else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                callback(throwErrMessage("Cannot publish SchemeId:" + operation.schemeId + ", current status: " + schemeIdRecord.status), null);
            }
        }
    });
};

function setNewSchemeIdRecord(scheme, operation,action,callback){

    setAvailableSchemeIdRecord2NewStatus(scheme, operation, action, function(err,record) {

        if (err) {
            callback(throwErrMessage("error getting available schemeId for:" + scheme  + ", err: " + JSON.stringify(err)), null);
            return;
        } else if (record) {
            callback(null, record);
        } else {
            counterMode(scheme, operation,action,function (err, newSchemeId) {
                if (err) {
                    callback(err, null);
                } else {

                    callback(null, newSchemeId);
                }
            });
        }
    });
};

function counterMode(scheme, operation, action, callback){

    getNextSchemeId(scheme, operation, function (err, newSchemeId) {
        if (err) {
            callback(err, null);
        } else {
            getSchemeId(scheme, newSchemeId, function (err, schemeIdRecord) {

                if (err) {
                    callback(err, null);
                } else {
                    var newStatus = stateMachine.getNewStatus(schemeIdRecord.status, action);
                    if (newStatus) {

                        if (operation.systemId && operation.systemId.trim() != "") {
                            schemeIdRecord.systemId = operation.systemId;
                        }
                        schemeIdRecord.status = newStatus;
                        schemeIdRecord.author = operation.author;
                        schemeIdRecord.software = operation.software;
                        schemeIdRecord.expirationDate = operation.expirationDate;
                        schemeIdRecord.comment = operation.comment;
                        schemeIdRecord.jobId = null;

                        updateSchemeIdRecord(schemeIdRecord, function (err, updatedRecord) {

                            if (err) {
                                callback(err, null);
                            } else {

                                callback(null, updatedRecord);
                            }
                        });
                    } else {
                        counterMode(scheme, operation, action, callback);
                    }
                }
            });
        }
    });
}

function setAvailableSchemeIdRecord2NewStatus(scheme, operation, action, callback){
    var query={scheme:scheme, status: stateMachine.statuses.available };

    schemeid.find(query ,1 ,null, function(err, schemeIdRecords){
        if (err) {
            callback(err, null);
        }else if (schemeIdRecords && schemeIdRecords.length>0){
            var newStatus = stateMachine.getNewStatus(schemeIdRecords[0].status, action);
            if (newStatus) {

                if (operation.systemId && operation.systemId.trim() != "") {
                    schemeIdRecords[0].systemId = operation.systemId;
                }
                schemeIdRecords[0].status = newStatus;
                schemeIdRecords[0].author = operation.author;
                schemeIdRecords[0].software = operation.software;
                schemeIdRecords[0].expirationDate = operation.expirationDate;
                schemeIdRecords[0].comment = operation.comment;
                schemeIdRecords[0].jobId = null;

                updateSchemeIdRecord(schemeIdRecords[0], function (err, updatedRecord) {

                    if (err) {
                        callback(err, null);
                    } else {

                        callback(null, updatedRecord);
                    }
                });
            } else {
                counterMode(scheme, operation, action, callback);
            }
        }else {
            callback(null, null);
        }
    });
}

function getNextSchemeId(scheme, operation, callback){
    getModel(function(err) {
        if (err) {
            callback(err, null);

        } else {
            var key = scheme;
            model.schemeIdBase.get(key, function (err, schemaIdBaseRecord) {

                var nextId = schemes[scheme.toUpperCase()].getNextId(schemaIdBaseRecord.idBase);
                schemaIdBaseRecord.idBase = nextId;

                schemaIdBaseRecord.save(function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, nextId);
                    }
                })
            });
        }
    });
};

function updateSchemeIdRecord(schemeIdRecord, callback) {

    schemeid.save(schemeIdRecord, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, schemeIdRecord);
        }
    })
}

function insertSchemeIdRecord(newSchemeIdRecord, callback){

    schemeid.create(newSchemeIdRecord, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, newSchemeIdRecord);
        }
    });
}

var initializeScheme=function (scheme,initialValue,callback) {
    getModel(function(err) {
        if (err) {
            callback(err, null);

        } else {
            model.schemeIdBase.find({scheme:scheme.toUpperCase()}).remove(function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    model.schemeIdBase.create({scheme: scheme.toUpperCase(), idBase: initialValue}, function (err) {
                        if (err) {
                            callback(err, null);
                        }else {
                            callback(null, null);
                        }
                    });

                }
            });
        }
    });
};

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

module.exports.publishSchemeId=publishSchemeId;
module.exports.releaseSchemeId=releaseSchemeId;
module.exports.deprecateSchemeId=deprecateSchemeId;
module.exports.registerSchemeId=registerSchemeId;
module.exports.generateSchemeId=generateSchemeId;
module.exports.reserveSchemeId=reserveSchemeId;
module.exports.getSchemeIdBySystemId=getSchemeIdBySystemId;
module.exports.getSchemeId=getSchemeId;
module.exports.getSchemeIds=getSchemeIds;
module.exports.initializeScheme=initializeScheme;
