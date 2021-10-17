import { Pragmas } from "./pragma";
export function runCreepPragmas(creep:Creep){
    if(!creep.memory.Pragma || !Pragmas[creep.memory.Pragma]) return;

    if(!Pragmas[creep.memory.Pragma].assigned.includes(creep.id)){
        Pragmas[creep.memory.Pragma].assigned.push(creep.id)
    }
    Pragmas[creep.memory.Pragma].action(creep)
}