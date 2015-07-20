/**
 * Created by alo on 7/15/15.
 */
var AtlassianCrowd = require('atlassian-crowd');

var options = {
    "crowd": {
        "base": "https://dev-crowd.ihtsdotools.org/crowd/"
    },
    "application": {
        "name": "component-id-service",
        "password": "snomedid"
    }
}

var crowd = new AtlassianCrowd(options);

crowd.ping(function (err, res) {
    if(err) {
        throw err;
    }
    else {
        console.log(res)
    }
});

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
    crowd.session.authenticate(token, function (err, res) {
        if(err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
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
            callback(null, res);
        }
    });
};

module.exports.addMember = function addMember (username, groupName, callback) {
    crowd.groups.addmember(username, groupName, function(err, res) {
        if(err) {
            callback(err);
        } else {
            callback(null, {});
        }
    });
};

module.exports.removeMember = function removeMember (username, groupName, callback) {
    crowd.groups.removemember(username, groupName, function(err, res) {
        if(err) {
            callback(err);
        } else {
            callback(null, {});
        }
    });
};
