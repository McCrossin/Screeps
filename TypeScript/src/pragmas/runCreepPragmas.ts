import { Pragmas } from "./pragma";
export function runCreepPragmas(creep:Creep){
    if(!creep.memory.Pragma || !Pragmas[creep.memory.Pragma]) return;

    Pragmas[creep.memory.Pragma].action(creep)
}