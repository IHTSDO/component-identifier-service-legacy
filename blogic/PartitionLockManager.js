var locks = require('locks');

//Map lock only used to create new partitionLocks entries
var mapLock = locks.createMutex();
var partitionLocks = new Object();
var timeoutSeconds = 2;

//key is unique for the namespace & partition.
module.exports.lockedOperation = function lockedOperation (key, callback) {
	var keyStr = JSON.stringify(key);
    var keyLock = partitionLocks[keyStr];
    
    // If lock does not exist - acquire the map lock and create new lock for this key
  if (keyLock == null) {
      mapLock.timedLock(timeoutSeconds * 1000, function (error) {
        if (error) {
            console.log('Could not get the partition map mutex lock within ' + timeoutSeconds + ' seconds, so gave up');
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
  
  if (keyLock != null) {
     keyLock.timedLock(timeoutSeconds * 1000, function (error) {
       callback();
       keyLock.unlock();
     });
  }
};
