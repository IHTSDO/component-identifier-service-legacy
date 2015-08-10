/**
 * Created by tom on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");
//var namespace = require("../blogic/NamespaceDataManager");
//var scheme = require("../blogic/SchemeDataManager");
var home = require("../blogic/HomeDataManager");

module.exports.getStats = function getStats (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err)
            return next(err.message);
        else{
            home.getStats(username, function(err, result){
                if (err) {
                    return next(err.message);
                }else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                }
            });
        }
    });
};
