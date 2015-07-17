/**
 * Created by alo on 7/14/15.
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

//crowd.user.authenticate('greynoso', 'snomed11', function(err, res) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(res);
//    }
//});
//
//crowd.session.create('alopez', 'snomed11', function (err, token) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(token);
//    }
//});

//crowd.session.authenticate("ymBPALanrqy8VYIAkL1tQw00", '127.0.0.1', function (err, res) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(res);
//    }
//});

//crowd.user.groups('greynoso', function (err, res) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(res);
//    }
//});

//crowd.user.find('greynoso', function(err, res) {
//    if(err) {
//        throw err;
//    }
//    else {
//        console.log(res);
//    }
//});

crowd.user.groups('greynoso', function (err, res) {
    if(err) {
        throw err;
    }
    else {
        console.log(res);
    }
});