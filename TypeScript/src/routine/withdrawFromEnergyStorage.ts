import { setState, States } from "./states";
import { routineResult } from "./routineResult";

/**
 * Deposits to energy storage
 * gets a creep to move to and deposit energy its holding till empty
 * @param creep creep with energy to deposit
 */
export function withdrawFromEnergyStorage(creep:Creep){
    //Get potential storage targets
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && 
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    // if we have storage targets move to them and transfer
    if(targets.length > 0) {
        let transfer = creep.withdraw(targets[0], RESOURCE_ENERGY)
        
        if( transfer== ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }

        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            delete creep.memory.energySource
            return routineResult.SUCCESS
        }else{
            return routineResult.INPROGRESS
        }
    }else{
        return routineResult.FAILURE
    }
}