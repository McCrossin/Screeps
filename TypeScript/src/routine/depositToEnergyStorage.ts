import { routineResult } from "./routineResult";
import { setState, States } from "./states";


/**
 * Deposits to energy storage
 * gets a creep to move to and deposit energy its holding till empty
 * @param creep creep with energy to deposit
 */
export function depositToEnergyStorage(creep:Creep){
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
        return transferEnergyToStructure(creep,targets[0])
    }else{
        // Energy Storage is full!
        return routineResult.FAILURE
    }
}

export function transferEnergyToStructure(creep:Creep,structure:Structure<StructureConstant>){
    let transfer = creep.transfer(structure, RESOURCE_ENERGY)
        
    //console.log(transfer)
    if( transfer== ERR_NOT_IN_RANGE) {
        creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}});
    }
    if(transfer == ERR_NOT_ENOUGH_ENERGY){
        setState(States.GET_ENERGY)(creep);
        return routineResult.SUCCESS
    }
    if(transfer == ERR_FULL){
        return routineResult.FAILURE
    }
    return routineResult.INPROGRESS
}