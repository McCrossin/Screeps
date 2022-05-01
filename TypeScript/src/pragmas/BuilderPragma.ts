import { Pragma } from "./pragma";
import { setState, States } from "routine/states";
import { getEnergyFromSource } from "routine/getEnergyFromSource";
import { routineResult } from "routine/routineResult";
import { spawnRole } from "roles/spawnRole";
import { roles, RoleTypes } from "roles/roleTypes";
import { buildConstructionSites } from "routine/buildconstrucionsites";
import { withdrawFromEnergyStorage } from "routine/withdrawFromEnergyStorage";

export class builderPramga extends Pragma {
    
    shouldSpawn(OwnedRoom:string){
        if(this.minions(OwnedRoom).length > 3) return false
        return true
    }

    spawn(){
        for (let id in Memory.OwnedRooms){
            
            if(this.shouldSpawn(id) == true){
                spawnRole(
                    id,
                    this.id,
                    RoleTypes.T1,
                    roles[RoleTypes.T1](Game.rooms[id].energyAvailable)
                )
            }
        }
    }
    // Building the closest construction site or get energy if needed
    action(creep:Creep) {

        if(!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            setState(States.GET_ENERGY)(creep);
            creep.say('🔄 harvest');
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            setState(States.WORKING)(creep);
            creep.say('🚧 build');
        }
        if(creep.memory.state === States.GET_ENERGY){
            let energyPercentage = creep.room.energyAvailable/creep.room.energyCapacityAvailable;

            if (energyPercentage > 0.8){
                if (withdrawFromEnergyStorage(creep) === routineResult.SUCCESS){
                    setState(States.WORKING)(creep)
                }
            }else if(getEnergyFromSource(creep,creep.memory.OwnedRoom) === routineResult.SUCCESS){
                setState(States.WORKING)(creep)
            }
        }
        if(creep.memory.state == States.WORKING){
            buildConstructionSites(creep)
        }
    }
}