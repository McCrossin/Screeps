import { Pragmas } from "./pragma";

export function runCreepPragmas(creep:Creep){
    // Exit if the creep doesnt have a pragma
    if(!creep.memory.Pragma || !Pragmas[creep.memory.Pragma]) return;
    // make sure the pragma knows about this assigned creep
    if(!Pragmas[creep.memory.Pragma].assigned.includes(creep.id)){
        
        Pragmas[creep.memory.Pragma].assigned.push(creep.id)
    }
    // Execute pragmas action method on the current creep
    Pragmas[creep.memory.Pragma].action(creep)
}