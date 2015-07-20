var assert = require("assert");
var should = require('should');
var security = require("../blogic/Security");



describe('Users', function() {
    describe('#findUser()', function () {
        it('should return the user object', function (done) {
            security.findUser("alopez", function(err, userObj) {
                if (err) throw err;
                userObj.name.should.equal("alopez");
                userObj["first-name"].should.equal("Alejandro");
                userObj["last-name"].should.equal("Lopez Osornio");
                done();
            });
        });
    });
    describe('#getGroups()', function () {
        it('should return the crowd groups', function (done) {
            security.getGroups("alopez", function(err, groups) {
                if (err) throw err;
                groups.length.should.be.above(2);
                groups.should.containEql("termMed");
                done();
            });
        });
    });
    var usersCount = 0;
    describe('#getGroupUsers()', function () {
        it('should return the group users', function (done) {
            security.getGroupUsers("termMed", function(err, users) {
                if (err) throw err;
                users.length.should.be.above(2);
                users.should.containEql("alopez");
                users.should.containEql("greynoso");
                usersCount = users.length;
                done();
            });
        });
    });
    describe('#addMember()', function () {
        it('should add the user to the group with no error', function (done) {
            security.addMember("rory-test","termMed", function(err, groups) {
                if (err) throw err;
                done();
            });
        });
        it('should have one more user in the group', function (done) {
            security.getGroupUsers("termMed", function(err, users) {
                if (err) throw err;
                users.length.should.be.equal(usersCount+1);
                users.should.containEql("rory-test");
                done();
            });
        });
    });
    describe('#removeMember()', function () {
        it('should remove the user from the group with no error', function (done) {
            security.removeMember("rory-test","termMed", function(err, groups) {
                if (err) throw err;
                done();
            });
        });

        it('should have one user less in the group', function (done) {
            security.getGroupUsers("termMed", function(err, users) {
                if (err) throw err;
                users.length.should.be.equal(usersCount);
                users.should.not.containEql("rory-test");
                done();
            });
        });
    });
    describe('#allUsers()', function () {
        it('should retrieve all users', function (done) {
            security.allUsers(function(err, data) {
                if (err) throw err;
                data.users.length.should.be.above(50);
                done();
            });
        });
    });
    describe('#searchUsers()', function () {
        it('should retrieve only users starting with "alo"', function (done) {
            security.searchUsers("alo", function(err, data) {
                if (err) throw err;
                data.users.length.should.be.below(10);
                done();
            });
        });
    });
});