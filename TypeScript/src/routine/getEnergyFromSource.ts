import { Pragmas } from "pragmas/pragma";
import { byId } from "selectors/byId";
import { routineResult } from "./routineResult";

declare global {

    /**
     * Creep memory
     * property to specify the energy source target for the creep
     */
    interface CreepMemory {
        energySource?: Id<Source>
    }
}



/**
 * Gets energy from source
 * @param creep creep performing the action
 * @param OwnedRoom The ID of the room the source is in
 * @param [sourceId] the id of the energy source
 * @returns a routine success or failure
 */
export function getEnergyFromSource(creep:Creep,OwnedRoom:string,sourceId?:Id<Source>){
    
    // Set the creeps target if specified as a variable
    if(!creep.memory.energySource){
        if(byId(sourceId) != undefined) creep.memory.energySource = sourceId
    }

    let energySourceTarget = Game.getObjectById(creep.memory.energySource as Id<Source>)
    
    // if the source has no energy unset it as a target and return
    if (energySourceTarget?.energy === 0){
        delete creep.memory.energySource
        return routineResult.FAILURE
    }
    // find an energy source for the creep if it doesnt have one assigned
    if(!creep.memory.energySource){
        let room  = Game.rooms[OwnedRoom]
        if (room){

            let [source1,source2] = room.memory.sources.map(sources =>
                {
                //check we can get the source object
                let sourceId = sources.id as Id<Source>
                let sourceObj = Game.getObjectById(sourceId)
                if(!sourceObj) return;

                // return the position info of the source object
                return{pos: sourceObj?.pos,sourceId,source:sourceObj};
                
            // filter results make sure its a source and has energy    
            }).filter(s => !s?.source || (s.source.energy > 0))
            

            if(!source1) return routineResult.FAILURE
            // Set the creep energy source to the source that has the closed linear range
            // assuming their is 2 sources to choose from
            creep.memory.energySource = (
            !source2 ||
            (source1.pos?.getRangeTo(creep.pos) ?? 0) < (source2.pos?.getRangeTo(creep.pos) ?? 0)
            ) ? source1.sourceId : source2.sourceId
        }
    }

    // expected to have an energy source assigned by now
    if(!creep.memory.energySource) return routineResult.FAILURE


    let source = Game.getObjectById(creep.memory.energySource)
    if (!source) return routineResult.FAILURE
    // Move to within range of the Source and mine it
    if (creep.moveTo(source.pos) == OK){
        if (creep.harvest(source) == ERR_NOT_IN_RANGE || OK){
            return routineResult.INPROGRESS
        }
    }
    // harvest till capacity is free then return success and forget this energy source
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
        delete creep.memory.energySource
        return routineResult.SUCCESS
    }else{
        return routineResult.INPROGRESS
    }
}