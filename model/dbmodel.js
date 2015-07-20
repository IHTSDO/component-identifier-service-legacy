/**
 * Created by ar on 7/16/15.
 */
var mUse={
    createdProperty: 'created_at',
    modifiedProperty: 'modified_at',
    expireProperty: false,
    dbtype: { type: 'date', time: true },
    now: function() { return new Date(); },
    expire: function() { var d = new Date(); return d.setMinutes(d.getMinutes() + 60); },
    persist: true
};
var sctIdRecord={name: "sctid_record",
    fields: {
        sctid: { type: 'text', size:18},
        sequence: Number,
        namespace: { type: 'integer'},
        partitionId: String,
        checkDigit: { type: 'integer'},
        systemId: String,
        status: String,
        author: String,
        software: String,
        expirationDate: Date,
        comment: String
    }, features:{
        id: 'sctid',
        timestamp: true
    }
};

var namespaceRecord={name: "namespace",
    fields: {
        namespace: { type: 'integer', key: true },
        organizationName: String,
        email: String,
        partitionId: { type: 'text', key: true },
        sequence: Number
    }
};

var model={
    sctIdTable:sctIdRecord,
    namespaceTable:namespaceRecord
};

module.exports.mUse=mUse;
module.exports.sctIdRecord=sctIdRecord;
module.exports.model=model;