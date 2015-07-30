/**
 * Created by alo on 7/28/15.
 */
var schemeId = require("../blogic/SchemeIdDataManager");

schemeId.initializeScheme("CTV3ID", "XUsHS", function (err, data) {
    if (err)
        throw err;
    else{
        schemeId.initializeScheme("SNOMEDID", "R-FF43C", function (err, data) {
            if (err)
                throw err;
            else{
                process.exit(code = 0);
            }
        });
    }
});
