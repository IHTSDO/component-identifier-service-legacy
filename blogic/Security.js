/**
 * Created by alo on 7/15/15.
 */
var AtlassianCrowd = require('atlassian-crowd');

var options = {
    "crowd": {
        "base": process.env.crowd_url
    },
    "application": {
        "name": process.env.crowd_app_name,
        "password": process.env.crowd_app_password
    }
};

var authenticationCache = {};
module.exports.admins = [];
module.exports.users = [];

var crowd = new AtlassianCrowd(options);

//crowd.ping(function (err, res) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(res)
//    }
//});

module.exports.createSession = function createSession (username, password, callback) {
    crowd.session.create(username, password, function (err, token) {
        if(err) {
            callback(err);
        } else {
            callback(null, token);
        }
    });
};

module.exports.authenticate = function authenticate (token, callback) {
    if (authenticationCache[token]) {
        var now = Date.now();
        var ago = (Date.now() - authenticationCache[token].timestamp);
        if (ago < (60000*60)) {
            callback(null, authenticationCache[token].res);
        } else {
            delete authenticationCache[token];
            crowd.session.authenticate(token, function (err, res) {
                if(err) {
                    callback(err);
                } else {
                    authenticationCache[token] = {
                        timestamp: now,
                        res: res
                    };
                    callback(null, res);
                }
            });
        }
    } else {
        crowd.session.authenticate(token, function (err, res) {
            if(err) {
                callback(err);
            } else {
                authenticationCache[token] = {
                    timestamp: now,
                    res: res
                };
                callback(null, res);
            }
        });
    }
};

module.exports.destroySession = function destroySession (token, callback) {
    crowd.session.destroy(token, function (err) {
        if(err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

module.exports.findUser = function findUser (username, callback) {
    crowd.user.find(username, function(err, res) {
        if(err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

module.exports.getGroups = function getGroups (username, callback) {
    crowd.user.groups(username, function(err, res) {
        if(err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

module.exports.getGroupUsers = function getGroupUsers (groupName, callback) {
    crowd.groups.directmembers(groupName, function(err, res) {
        if(err) {
            callback(err);
        } else {
            if (groupName == "component-identifier-service-admin") {
                module.exports.admins = res;
            } else if (groupName == "component-identifier-service-user") {
                module.exports.users = res;
            }
            callback(null, res);
        }
    });
};

module.exports.addMember = function addMember (username, groupName, callback) {
    crowd.groups.addmember(username, groupName, function(err, res) {
        if(err) {
            callback(err);
        } else {
            updateGroupCache();
            callback(null, {});
        }
    });
};

module.exports.removeMember = function removeMember (username, groupName, callback) {
    crowd.groups.removemember(username, groupName, function(err, res) {
        if(err) {
            callback(err);
        } else {
            updateGroupCache();
            callback(null, {});
        }
    });
};

module.exports.allUsers = function allUsers (callback) {
    crowd.search('user', '', function (err, res) {
        if(err) {
            throw err;
        }
        else {
            callback(null, res);
        }
    });
};

module.exports.searchUsers = function searchUsers (searchString, callback) {
    crowd.search('user', 'name="' + searchString + '*"', function (err, res) {
        if(err) {
            throw err;
        }
        else {
            callback(null, res);
        }
    });
};

var updateGroupCache = function() {
    module.exports.getGroupUsers("component-identifier-service-admin", function(err,res) {
        // cache only
    });
    module.exports.getGroupUsers("component-identifier-service-user", function(err,res) {
        // cache only
    });
};
updateGroupCache();
