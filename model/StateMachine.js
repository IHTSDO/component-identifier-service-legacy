/**
 * Created by ar on 7/23/15.
 */
var statuses={
    available:"Available",
    assigned:"Assigned",
    reserved:"Reserved",
    published:"Published",
    deprecated:"Deprecated"
};

var actions={
    register:"Register",
    generate:"Generate",
    deprecate:"Deprecate",
    publish:"Publish",
    release:"Release",
    reserve:"Reserve"
};
var state=[];

state[statuses.available]=[[actions.register,statuses.assigned],[actions.generate,statuses.assigned],[actions.reserve,statuses.reserved]];
state[statuses.assigned]=[[actions.deprecate,statuses.deprecated],[actions.publish,statuses.published],[actions.release,statuses.available]];
state[statuses.reserved]=[[actions.release,statuses.available],[actions.register,statuses.assigned]];
state[statuses.published]=[[actions.deprecate,statuses.deprecated]];
state[statuses.deprecated]=[];

module.exports.getNewStatus=function(status,action){
    var newStat=null;
    if (state[status]){
        var actions=state[status];
        actions.forEach(function(validAction){
            if (validAction[0]==action){
                newStat= validAction[1];
            }
        })
    }
    return newStat;
};
module.exports.statuses=statuses;
module.exports.actions=actions;