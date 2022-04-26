import { Pragma } from "./pragma";
import { setState, States } from "routine/states";
import { getEnergyFromSource } from "routine/getEnergyFromSource";
import { routineResult } from "routine/routineResult";
import { spawnRole } from "roles/spawnRole";
import { roles, RoleTypes } from "roles/roleTypes";

/**
 * Upgrade pramga
 * Logic to upgrade Rooms
 */
export class upgradePramga extends Pragma {
    

    /**
     * Should spawn
     * determins if we should spawn creeps for this pragma
     * @param OwnedRoom room to check if we should spawn
     * @returns  
     */
    shouldSpawn(OwnedRoom:string){
        // TODO do better than this currently no more than 2 upgraders
        if(this.minions(OwnedRoom).length > 2) return false
        return true
    }

    /**
     * Spawns upgrade pramga
     * spawns minions if should spawn returns true
     * currently limited to T1 creeps
     */
    spawn(){
        for (let id in Memory.OwnedRooms){
            
            if(this.shouldSpawn(id) == true){
                spawnRole(
                    id,
                    this.id,
                    RoleTypes.T1,
                    roles[RoleTypes.T1](150)
                )
            }
        }
    }


    /**
     * Actions upgrade pramga
     * Currently creeps will upgrade the controller 
     * in the  room and get energy as needed 
     * @param creep creep to task with an action
     * @returns  
     */
    action(creep:Creep) {

        if(!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            setState(States.GET_ENERGY)(creep);
            creep.say('🔄 harvest');
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            setState(States.WORKING)(creep);
            creep.say('⬆️ Upgrade');
        }
        if(creep.memory.state === States.GET_ENERGY){
            if(getEnergyFromSource(creep,creep.memory.OwnedRoom) === routineResult.SUCCESS){
                setState(States.WORKING)(creep)
            }
        }
        if(creep.memory.state == States.WORKING){
            let controller = creep.room.controller
            if(!controller) return;
            
            let result=creep.upgradeController(controller)
            if(result == ERR_NOT_IN_RANGE)creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            if (result == ERR_NOT_ENOUGH_ENERGY) setState(States.GET_ENERGY)(creep);
        }
    }
}