/**
 * Created by alo on 7/7/15.
 */
var orm = require("orm");
var modts = require('orm-timestamps');
orm.connect("mysql://root@localhost/idtest1", function(err, db) {
    if (err) throw err;

    db.use(modts, {
        createdProperty: 'created_at',
        modifiedProperty: 'modified_at',
        expireProperty: false,
        dbtype: { type: 'date', time: true },
        now: function() { return new Date(); },
        expire: function() { var d = new Date(); return d.setMinutes(d.getMinutes() + 60); },
        persist: true
    });


    var SCTIDRecord = db.define("sctid_record", {
        sctid: String,
        sequence: Number,
        namespace: Number,
        partitionId: String,
        checkDigit: Number,
        systemId: String,
        status: String,
        author: String,
        software: String,
        expirationDate: Date,
        comment: String
    }, {
        id: 'sctid',
        timestamp: true
    });

    // add the table to the database
    db.sync(function(err) {
        if (err) throw err;

        // add a row to the person table
        SCTIDRecord.create({ sctid: "44691001", sequence: 44691, namespace: 0, partitionId: "00", checkDigit: 1, status: "assigned" }, function(err) {
            if (err) throw err;

            // query the person table by surname
            SCTIDRecord.find({ sctid: "44691001" }, function (err, sctids) {
                // SQL: "SELECT * FROM person WHERE surname = 'Doe'"
                if (err) throw err;

                console.log("sctids found: %d", sctids.length);
                console.log("First sctid: %s, %d", sctids[0].sctid, sctids[0].sequence);

//                people[0].age = 16;
//                people[0].save(function (err) {
//                    // err.msg = "under-age";
//                });
            });

        });
    });
});
