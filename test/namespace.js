var assert = require("assert");
var should = require('should');
var namespace = require("../blogic/NamespaceDataManager");

describe('Namespaces', function() {
    var randomNumber, namespacesLengthInitial = 0;
    describe('#getNamespaces()', function () {
        it('should return the namespaces', function (done) {
            namespace.getNamespaces(function(err, namespaces) {
                if (err) throw err;
                should.not.exist(err);
                namespacesLengthInitial = namespaces.length;
//                namespaces.length.should.be.equal(0);
                done();
            });
        });
    });
    describe('#createNamespace()', function () {
        it('should create a namespace', function (done) {
            randomNumber = Math.round(Math.random() * 1000000);
            namespace.createNamespace({namespace: randomNumber, organizationName: "Ar asdas", email: "asdsa@sdadasd.cpm"},function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });
    describe('#createPermission()', function () {
        it('should create a permission for the namespace', function (done) {
            namespace.createPermission({namespace: randomNumber, username: "test", role: "admin"},function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });

    describe('#getPermissions()', function () {
        it('should get the permission created', function (done) {
            namespace.getPermissions(randomNumber,function(err, permissions) {
                if (err) throw err;
                should.not.exist(err);
                permissions.length.should.be.equal(1);
                done();
            });
        });
    });

    describe('#getNamespacesForUser()', function () {
        it('should return the namespace created', function (done) {
            namespace.getNamespacesForUser("test", function(err, namespaces) {
                if (err) throw err;
                should.not.exist(err);
                namespaces.length.should.be.equal(1);
                done();
            });
        });
    });

    describe('#deletePermission()', function () {
        it('should delete the permission created', function (done) {
            namespace.deletePermission(randomNumber, "test",function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
        it('should return no permissions', function (done) {
            namespace.getPermissions(randomNumber,function(err, permissions) {
                if (err) throw err;
                should.not.exist(err);
                permissions.length.should.be.equal(0);
                done();
            });
        });
    });
    describe('#getNamespace()', function () {
        it('should return the created namespace', function (done) {
            namespace.getNamespace(randomNumber, function(err, namespaces) {
                if (err) throw err;
                should.not.exist(err);
                namespaces.length.should.be.equal(1);
                done();
            });
        });
    });
    describe('#editNamespace()', function () {
        it('should edit the created namespace', function (done) {
            namespace.editNamespace(randomNumber, {organizationName: "Ar asdas2", email: "asdsa@sdadasd.com"},function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });
    describe('#editPartition()', function () {
        it('should edit the created namespace', function (done) {
            namespace.editPartition([randomNumber, "10"], 23,function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
    });

    describe('#deleteNamespace()', function () {
        it('should delete a namespace', function (done) {
            namespace.deleteNamespace(randomNumber,function(err) {
                if (err) throw err;
                should.not.exist(err);
                done();
            });
        });
        it('should return the initial length of namespaces', function (done) {
            namespace.getNamespaces(function(err, namespaces) {
                if (err) throw err;
                should.not.exist(err);
                namespaces.length.should.be.equal(namespacesLengthInitial);
                done();
            });
        });
    });

});