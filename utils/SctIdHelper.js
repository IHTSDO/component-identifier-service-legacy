/**
 * Created by ar on 7/16/15.
 */

var init=function(){

    for (var i = 2; i < 8; i++) {
        for (var j = 0; j < 10; j++) {
            FnF[i][j] = FnF[i - 1][FnF[1][j]];
        }
    }
};
var FnF = [ [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ], [ 1, 5, 7, 6, 2, 8, 3, 0, 9, 4 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ];


var Dihedral = [[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ], [ 1, 2, 3, 4, 0, 6, 7, 8, 9, 5 ], [ 2, 3, 4, 0, 1, 7, 8, 9, 5, 6 ], [ 3, 4, 0, 1, 2, 8, 9, 5, 6, 7 ], [ 4, 0, 1, 2, 3, 9, 5, 6, 7, 8 ], [ 5, 9, 8, 7, 6, 0, 4, 3, 2, 1 ], [ 6, 5, 9, 8, 7, 1, 0, 4, 3, 2 ],
    [ 7, 6, 5, 9, 8, 2, 1, 0, 4, 3 ], [ 8, 7, 6, 5, 9, 3, 2, 1, 0, 4 ], [ 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ] ];

var InverseD5 = [ 0, 4, 3, 2, 1, 5, 6, 7, 8, 9 ];

var verhoeffCompute=function (idAsString) {
    var check = 0;
    for (var i = idAsString.length - 1; i >= 0; i--) {
        check = Dihedral[check][FnF[((idAsString.length - i) % 8)][ idAsString.charAt(i) ]];

    }
    return InverseD5[check];
};

var validSCTId=function (sctid){
    var tmp=sctid.toString();
    try{

        parseFloat(tmp);

        var cd=tmp.substr(tmp.length-1,1);
        var num=tmp.substr(0,tmp.length-1);
        var ret=verhoeffCompute(num);
        return parseInt(cd)==ret;

    }catch (e){
        console.log("parser error:" + e);
    }

    return false;
};

var getSequence=function(sctid){
    if (sctid){
        if (!validSCTId(sctid)){
            return null;
        }
        var tmp=sctid.toString();
        var partition=getPartition(tmp);
        if (partition.substr(0,1)=="1" ){
            if ( tmp.length<11){
                return null;
            }else{
                return parseFloat(tmp.substr(0,tmp.length-10));
            }
        }
        var ret=parseFloat(tmp.substr(0,tmp.length-3));
        return  ret;
    }
    return null;
};
var getPartition=function(sctid){
    if (sctid){
        var tmp=sctid.toString();
        if ( tmp.length>3){
            return tmp.substr(tmp.length-3,2);
        }
        return null
    }
    return null;
};

var getCheckDigit=function(sctid){
    if (sctid){
        if (!validSCTId(sctid)){
            return null;
        }
        var tmp=sctid.toString();

        return  parseInt(tmp.substr(tmp.length-1,1));
    }
    return null;
};

var getNamespace=function(sctid){
    if (sctid){
        if (!validSCTId(sctid)){
            return null;
        }
        var tmp=sctid.toString();
        var partition=getPartition(tmp);
        if (partition.substr(0,1)=="1" ){
            if ( tmp.length<11){
                return null;
            }else{
                return parseInt(tmp.substr(tmp.length-10,7));
            }
        }

        return  0;
    }
    return null;
};
module.exports.verhoeffCompute=verhoeffCompute;
module.exports.getPartition=getPartition;
module.exports.getNamespace=getNamespace;
module.exports.getCheckDigit=getCheckDigit;
module.exports.validSCTId=validSCTId;
module.exports.getSequence=getSequence;
init();
