/**
 * Created by ar on 7/27/15.
 */
var getNextId= function (previousId){
    var prefix=previousId.substring(0,previousId.indexOf("-"));
    var hexBase=previousId.substr(previousId.indexOf("-") + 1);

    if (hexBase.toUpperCase()>="FFFFF") {

        var letter = prefix.substr(0, 1);
        var prefixCount = "";

        var j;
        for (j = 1; j < prefix.length; j++) {
            prefixCount += "" + prefix.substr(j, 1);
        }
        if (prefixCount==""){
            prefix=letter + "0";
        }else{
            prefix = letter + (parseInt("0x" + prefixCount, 16) + 1).toString(16).toUpperCase();

        }
        return prefix + "-00000";

    }else {
        var newHexBase = parseInt("0x" + hexBase, 16) + 1;
        newHexBase="00000" + newHexBase.toString(16).toUpperCase();

        return prefix + "-" +  newHexBase.substr(newHexBase.length - 5);

    }

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

