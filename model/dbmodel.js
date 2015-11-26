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

var schemeIdBaseRecord={name: "schemeIdBase",
    fields: {
        scheme: { type: 'text', size:18, key: true},
        idBase : { type: 'text', size:18}
    }, features:{
        cache: false
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
        sequence: {type: 'integer', size:8}
    }
    , features:{
        cache: false
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
    schemeIdBase:schemeIdBaseRecord,
    namespace:namespaceRecord,
    partitions:partitionRecord,
    permissionsNamespace:permissionsNamespaceRecord,
    permissionsScheme: permissionsSchemeRecord
};

module.exports.mUse=mUse;
module.exports.model=model;