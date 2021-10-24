import { Pragma } from "./pragma";
import { setState, States } from "routine/states";
import { getEnergyFromSource } from "routine/getEnergyFromSource";
import { routineResult } from "routine/routineResult";
import { spawnRole } from "roles/spawnRole";
import { roles, RoleTypes } from "roles/roleTypes";

export class upgradePramga extends Pragma {
    
    shouldSpawn(OwnedRoom:string){
        if(this.minions(OwnedRoom).length > 2) return false
        return true
    }

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
    action(creep:Creep) {

        if(!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            setState(States.GET_ENERGY)(creep);
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            setState(States.WORKING)(creep);
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