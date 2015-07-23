var assert = require("assert");
var should = require('should');
var scheme = require("../blogic/SchemeDataManager");

describe('Schemes', function() {
    describe('#createPermission()', function () {
        it('should create a permission for the scheme', function (done) {
            scheme.createPermission({scheme: "TESTID", username: "test", role: "admin"},function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });

    describe('#getPermissions()', function () {
        it('should get the permission created', function (done) {
            scheme.getPermissions("TESTID",function(err, permissions) {
                if (err) throw err;
                should.not.exist(err);
                permissions.length.should.be.equal(1);
                done();
            });
        });
    });

    describe('#getSchemesForUser()', function () {
        it('should return the scheme of the permission created', function (done) {
            scheme.getSchemesForUser("test", function(err, schemes) {
                if (err) throw err;
                should.not.exist(err);
                schemes.length.should.be.equal(1);
                done();
            });
        });
    });

    describe('#deletePermission()', function () {
        it('should delete the permission created', function (done) {
            scheme.deletePermission("TESTID", "test",function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
        it('should return no permissions', function (done) {
            scheme.getPermissions("TESTID",function(err, permissions) {
                if (err) throw err;
                should.not.exist(err);
                permissions.length.should.be.equal(0);
                done();
            });
        });
    });
});