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
        if (err){
            res.setHeader('Content-Type', 'application/json');
            res.status(400);
            res.end(JSON.stringify({message: err.message}));
        }else{
            home.getStats(username, function(err, result){
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(500);
                    res.end(JSON.stringify({message: err.message}));
                }else{
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                }
            });
        }
    });
};

module.exports.testService = function testService (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.end('Service Ok.');
};