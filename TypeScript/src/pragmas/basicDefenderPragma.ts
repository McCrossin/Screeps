import { Pragma } from "./pragma";
import { setState, States } from "routine/states";
import { getEnergyFromSource } from "routine/getEnergyFromSource";
import { routineResult } from "routine/routineResult";
import { spawnRole } from "roles/spawnRole";
import { roles, RoleTypes } from "roles/roleTypes";


//This idea has been dropped as the Source Defender is too Strong for basic bitches.
export class basicDefenderPramga extends Pragma {
    
    shouldSpawn(OwnedRoom:string){
        if(this.minions(OwnedRoom).length > 1) return false
        return true
    }

    spawn(){
        for (let id in Memory.OwnedRooms){
            
            if(this.shouldSpawn(id) == true){
                spawnRole(
                    id,
                    this.id,
                    RoleTypes.T1_Combat,
                    //TOASK Why is this sending 150 to roles?
                    roles[RoleTypes.T1_Combat](150)
                )
            }
        }
    }
    // Building the closest construction site or get energy if needed
    action(creep:Creep) {

        setState(States.WORKING)(creep)

        if(creep.memory.state == States.WORKING){
            let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if(target) {

                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                creep.attack(target)
                //console.log(attack)
                
            }
            
        }
    }
}