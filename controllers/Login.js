/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

var usersCache = {};

module.exports.login = function login (req, res, next) {
    var credentials = req.swagger.params.credentials.value;
    console.log("Login");
    console.log(credentials);
    security.createSession(credentials.username, credentials.password, function(err, data) {
        if (err) {
            console.log("err", err);
            return next(err.message);
        }
        console.log(data);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({"token":data}));
    });
};

module.exports.logout = function logout (req, res, next) {
    var token = req.swagger.params.token.value;
    security.destroySession(token.token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end({});
    });
};

module.exports.authenticate = function authenticate (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token.token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        if (usersCache[data.user.name]) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(usersCache[data.user.name]));
        } else {
            security.findUser(data.user.name, function(err2, userData) {
                if (err2) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data.user));
                } else {
                    usersCache[data.user.name] = userData;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(userData));
                }
            });
        }
    });
};

module.exports.getGroups = function getGroups (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    security.destroySession(token.token, function(err, data) {
        if (err) {
            return next(err.message);
        }
        security.getGroups(username, function(err2, groups) {
            if (err2) {
                return next(err2.message);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(groups));
            }
        });
    });
};