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
        email: String
    }
};

var partitionRecord={name: "partitions",
    fields: {
        namespace: { type: 'integer', key: true },
        partitionId: { type: 'text', key: true },
        sequence: Number
    }
};

var permissionsNamespaceRecord={name: "permissionsNamespace",
    fields: {
        namespace: { type: 'integer', key: true },
        username: { type: 'text', key: true },
        role: String
    }
};

var permissionsSchemeRecord={name: "permissionsScheme",
    fields: {
        scheme: { type: 'text', key: true },
        username: { type: 'text', key: true },
        role: String
    }
};

var model={
    sctIdTable:sctIdRecord,
    namespace:namespaceRecord,
    partitions:partitionRecord,
    permissionsNamespace:permissionsNamespaceRecord,
    permissionsScheme: permissionsSchemeRecord
};

module.exports.mUse=mUse;
module.exports.sctIdRecord=sctIdRecord;
module.exports.model=model;