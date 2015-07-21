var assert = require("assert");
var should = require('should');
var namespace = require("../blogic/NamespaceDataManager");

namespace.getNamespaces(function(err, namespaces) {
    if (err) throw err;
    namespaces.length.should.be.equal(0);
//    done();
});

//describe('Namespaces', function() {
//    describe('#getNamespaces()', function () {
//        it('should return the user object', function (done) {
//            namespace.getNamespaces(function(err, namespaces) {
//                if (err) throw err;
//                namespaces.length.should.be.equal(0);
//                done();
//            });
//        });
//    });
//
//});