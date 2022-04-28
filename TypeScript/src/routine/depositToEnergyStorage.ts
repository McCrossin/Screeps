import { roleBuilder } from "roles/builder";
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
        let transfer = creep.transfer(targets[0], RESOURCE_ENERGY)
        
        //console.log(transfer)
        if( transfer== ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
        
        if(transfer == ERR_NOT_ENOUGH_ENERGY) setState(States.GET_ENERGY)(creep);
    }else{
        //Turn harvester into builder (Solution is to spend more energy)
        //creep.memory.role = "builder";
    }
}