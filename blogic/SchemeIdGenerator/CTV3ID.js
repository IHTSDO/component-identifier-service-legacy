/**
 * Created by ar on 7/27/15.
 */
var baseDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var getNextId= function (previousId){
    var iterator = previousId.length;
    var decimalValue = 0;
    var multiplier = 1;

    while( iterator > 0 ) {
        decimalValue = decimalValue + ( baseDigits.indexOf( previousId.substring( iterator - 1, iterator ) ) * multiplier );
        multiplier = multiplier * 62;
        --iterator;
    }
    decimalValue++;

    var tempVal = decimalValue == 0 ? "0" : "";
    var mod = 0;

    while( parseInt(decimalValue) != 0 ) {
        mod = parseInt(decimalValue % 62);
        tempVal = baseDigits.substring( mod, mod + 1 ) + tempVal;
        decimalValue = decimalValue / 62;
    }
    return tempVal;
};

var getSequence=function (id){
    return null;
};

var getCheckDigit=function(id){
    return null;
};

module.exports.getNextId=getNextId;
module.exports.getSequence=getSequence;
module.exports.getCheckDigit=getCheckDigit;
