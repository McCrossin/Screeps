import { roles, RoleTypes } from "roles/roleTypes";
import { spawnRole } from "roles/spawnRole";
import { depositToEnergyStorage } from "routine/depositToEnergyStorage";
import { getEnergyFromSource } from "routine/getEnergyFromSource";
import { routineResult } from "routine/routineResult";
import { setState, States } from "routine/states";
import { byId } from "selectors/byId";
import { Pragma, Pragmas } from "./pragma";

export const OwnedRoomPragmas: Record<string, OwnedRoomPragma> = {};


export class OwnedRoomPragma extends Pragma {
    public distance: number = Infinity;
    public disabled = false;
    public constructor(priority: number,public OwnedRoom:string,public sourceId: Id<Source>){
        super(priority)
        this.id = `OwnedRoomPragma|${sourceId}`;
        if(OwnedRoomPragmas[this.id]){
            OwnedRoomPragmas[this.id].setup();
            return OwnedRoomPragmas[this.id];
        }
        OwnedRoomPragmas[this.id] = this
        this.setup()
    }
    checkOwnedRoom(){
        if(Game.rooms[this.OwnedRoom]) return true;
        this.disabled = true;
        delete OwnedRoomPragmas[this.id];
        delete Pragmas[this.id];
        return false;
    }

    setup(){
        if(!this.checkOwnedRoom()) return;
        
        if (this.distance !== Infinity && !this.disabled) return; // already set up
        const spawn = (Game.rooms[this.OwnedRoom].find(FIND_MY_SPAWNS))[0]
        const source = byId(this.sourceId)
        
        if(!source || !spawn){
            this.disabled = true
            return
        }
        const distance = PathFinder.search(
            spawn.pos,
            source.pos,
            {
                plainCost:2,
                swampCost:10,
                maxOps:10000
            }
        )
        if(distance===undefined){
            this.disabled=true
            return
        }
        this.distance=distance.cost
        this.disabled=false

    }
    spawn(){
        if(!this.checkOwnedRoom()) return;
        let maxCreeps = Memory.rooms[this.OwnedRoom].sources.find(source => (source.id == this.sourceId))?.capacity
        if(!maxCreeps) maxCreeps = 1
        if(this.assigned.length < maxCreeps){
            spawnRole(
                this.OwnedRoom,
                this.id,
                RoleTypes.T1,
                roles[RoleTypes.T1](150)
            )
        }

    }
    action(creep:Creep){
        if(!this.checkOwnedRoom()) return;
        // Lock the creeps to a specific energy source
        
        let result = getEnergyFromSource(creep,this.OwnedRoom,this.sourceId)

        // storage empty go mine
        if(!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            setState(States.GET_ENERGY)(creep);
        }
        // storage full deposit
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
            setState(States.DEPOSIT)(creep);
        }
        // deposit energy to storage
        if(creep.memory.state == States.DEPOSIT){
            depositToEnergyStorage(creep)
        }
    }
}
