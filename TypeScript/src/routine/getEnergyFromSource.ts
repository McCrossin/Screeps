import { Pragmas } from "pragmas/pragma";
import { routineResult } from "./routineResult";

declare global {
    interface CreepMemory {
        energySource?: Id<Source>
    }
}

export function getEnergyFromSource(creep:Creep,OwnedRoom:string,sourceId?:Id<Source>){
    if(!creep.memory.energySource){
        creep.memory.energySource = sourceId
    }

    let energySourceTarget = Game.getObjectById(creep.memory.energySource as Id<Source>)
    
    if (energySourceTarget?.energy === 0){
        delete creep.memory.energySource
        return routineResult.FAILURE
    }


    if(!creep.memory.energySource){
        let room  = Game.rooms[OwnedRoom]
        if (room){
            let [source1,source2] = room.memory.sources.map(sources =>{
                let sourceId = sources.id as Id<Source>
                let sourceObj = Game.getObjectById(sourceId)
                if(!sourceObj) return;
                return{pos: sourceObj?.pos,sourceId,source:sourceObj};})
                .filter(s => !s?.source || (s.source.energy > 0))
            if(!source1) return routineResult.FAILURE

            creep.memory.energySource = (
                !source2 ||
                (source1.pos?.getRangeTo(creep.pos) ?? 0) < (source2.pos?.getRangeTo(creep.pos) ?? 0)
            ) ? source1.sourceId : source2.sourceId
        }
    }

    if(!creep.memory.energySource) return routineResult.FAILURE

    let source = Game.getObjectById(creep.memory.energySource)
    if (!source) return routineResult.FAILURE
    if (creep.moveTo(source.pos) == OK){
        if (creep.harvest(source) == ERR_NOT_IN_RANGE || OK){
            return routineResult.INPROGRESS
        }
    }

    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
        delete creep.memory.energySource
        return routineResult.SUCCESS
    }else{
        return routineResult.INPROGRESS
    }

}