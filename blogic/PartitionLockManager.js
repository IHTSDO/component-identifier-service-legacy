var locks = require('locks');

// Map lock only used to create new partitionLocks entries
var mapLock = locks.createMutex();
var partitionLocks = new Object();
var createLockTimeoutSeconds = 2;
var acquireLockTimeoutSeconds = 10;

/*
 * The lock released automatically after callback so code in callback must be synchronous
 */
module.exports.lockedOperation = function lockedOperation(key, callback) {
    var keyLock = getLock(key);
    if (keyLock != null) {
        keyLock.timedLock(acquireLockTimeoutSeconds * 1000, function (error) {
            if (error) {
                console.log('Could not acquire the key lock within ' + acquireLockTimeoutSeconds + ' seconds, so gave up');
            } else {
                console.log("Locked partition " + key);
                callback();
                keyLock.unlock();
                console.log("Unlocked partition " + key);
            }
        });
    }
};

/*
 * The supplied callback is called passing an unlockCallback as an argument.
 * This must be run to release the lock otherwise it will timeout after the specified time.
 */
module.exports.lockedOperationManualRelease = function lockedOperationManualRelease(key, callback) {
    var keyLock = getLock(key);
    if (keyLock != null) {
        keyLock.timedLock(acquireLockTimeoutSeconds * 1000, function (error) {
            if (error) {
                console.log('Could not acquire the key lock within ' + acquireLockTimeoutSeconds + ' seconds, so gave up');
            } else {
                console.log("Locked partition " + key);
                callback(function() {
                    keyLock.unlock();
                    console.log("Unlocked partition " + key);
                });
            }
        });
    }
};

function getLock(key) {
    var keyStr = JSON.stringify(key);
    var keyLock = partitionLocks[keyStr];

    // If lock does not exist - acquire the map lock and create new lock for this key
    if (keyLock == null) {
        mapLock.timedLock(createLockTimeoutSeconds * 1000, function (error) {
            if (error) {
                console.log('Could not get the partition map mutex lock within ' + createLockTimeoutSeconds + ' seconds, so gave up');
            } else {
                if (keyLock == null) {
                    keyLock = locks.createMutex();
                    partitionLocks[keyStr] = keyLock;
                    console.log("Created partition lock object for " + keyStr);
                    mapLock.unlock();
                }
            }
        });
    }
    return keyLock;
}
