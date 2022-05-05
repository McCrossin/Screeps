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
            return (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_STORAGE ||
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN) && 
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    // if we have storage targets move to them and transfer
    if(targets.length > 0) {
        return withdrawEnergyFromStructure(creep,targets[0])
    }else{
        return routineResult.FAILURE
    }
}
export function withdrawEnergyFromStructure(creep:Creep,structure:Structure<StructureConstant>){
    let transfer = creep.withdraw(structure, RESOURCE_ENERGY)
        
    //console.log(transfer)
    if( transfer== ERR_NOT_IN_RANGE) {
        creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}});
    }
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
        return routineResult.SUCCESS
    }else{
        return routineResult.INPROGRESS
    }
}