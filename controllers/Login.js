/**
 * Created by alo on 7/13/15.
 */
'use strict';

var security = require("./../blogic/Security");

var usersCache = {};

module.exports.login = function login (req, res, next) {
    var credentials = req.swagger.params.credentials.value;
    security.createSession(credentials.username, credentials.password, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
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
        res.end(JSON.stringify({}));
    });
};

module.exports.authenticate = function authenticate (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token.token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
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

module.exports.getAllGroups = function getAllGroups (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        security.getAllGroups(function(err2, groups) {
            if (err2) {
                return next(err2.message);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(groups));
            }
        });
    });
};

module.exports.getGroups = function getGroups (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
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

module.exports.getGroupUsers = function getGroupUsers (req, res, next) {
    var token = req.swagger.params.token.value;
    var groupName = req.swagger.params.groupName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        security.getGroupUsers(groupName, function(err2, members) {
            if (err2) {
                return next(err2.message);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(members));
            }
        });
    });
};

module.exports.addMember = function addMember (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    var groupName = req.swagger.params.groupName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        security.addMember(username, groupName, function(err2, data) {
            if (err2) {
                return next(err2.message);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({}));
            }
        });
    });
};

module.exports.removeMember = function removeMember (req, res, next) {
    var token = req.swagger.params.token.value;
    var username = req.swagger.params.username.value;
    var groupName = req.swagger.params.groupName.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        security.removeMember(username, groupName, function(err2, data) {
            if (err2) {
                return next(err2.message);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({}));
            }
        });
    });
};

module.exports.getUsers = function getUsers (req, res, next) {
    var token = req.swagger.params.token.value;
    security.authenticate(token, function(err, data) {
        if (err) {
            return next({message: err.message, statusCode: 401});
        }
        if (req.swagger.params.searchString.value && req.swagger.params.searchString.value.length > 0) {
            var searchString = req.swagger.params.searchString.value;
            security.searchUsers(searchString, function(err2, data2) {
                if (err2) {
                    return next(err2.message);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    var users = [];
                    for (var userObj in data2.users) {
                        users.push(data2.users[userObj].name);
                    }
                    res.end(JSON.stringify(users));
                }
            });
        } else {
            security.allUsers(function(err2, data2) {
                if (err2) {
                    return next(err2.message);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    var users = [];
                    for (var userObj in data2.users) {
                        users.push(data2.users[userObj].name);
                    }
                    res.end(JSON.stringify(users));
                }
            });
        }
    });
};