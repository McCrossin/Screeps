import { roles, RoleTypes } from "roles/roleTypes";
import { spawnRole } from "roles/spawnRole";
import { buildConstructionSites } from "routine/buildconstrucionsites";
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
        // Make sure we dont have duplicates for this source
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
        if (this.disabled) return // this pragma has been disabled
        const spawn = (Game.rooms[this.OwnedRoom].find(FIND_MY_SPAWNS))[0]
        
        const source = byId(this.sourceId)
        
        if(!source || !spawn){
            this.disabled = true
            return
        }
        
        const distance = PathFinder.search(
            spawn.pos,
            {pos: source.pos,range:1},
            {
                plainCost:2,
                swampCost:10,
                maxOps:2000
            }
        )

        if(distance===undefined){
            this.disabled=true
            return
        }
        
        this.distance=distance.cost
        // Sets the priority the pramgas happen highest priority first
        // the higher the distance the lower the priority as a fractio
        this.priority += (1 / distance.cost)
        this.disabled=false
    }
    spawn(){
        if(!this.checkOwnedRoom() || this.disabled) return;
        let maxCreeps = Memory.OwnedRooms[this.OwnedRoom].sources.find(source => (source.id == this.sourceId))?.capacity
        if(!maxCreeps) maxCreeps = 1
        if(this.assigned.length < maxCreeps){
            spawnRole(
                this.OwnedRoom,
                this.id,
                RoleTypes.T1,
                roles[RoleTypes.T1](Game.rooms[this.OwnedRoom].energyAvailable)
            )
        }

    }
    action(creep:Creep){
        if(!this.checkOwnedRoom() || this.disabled) return;
        // Lock the creeps to a specific energy source
        if(creep.memory.role === RoleTypes.T2_Worker){

        }
        if(creep.memory.role === RoleTypes.T1){
            let result = getEnergyFromSource(creep,this.OwnedRoom,this.sourceId)

            // storage empty go mine
            if(!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
                setState(States.GET_ENERGY)(creep);
                creep.say('🔄 harvest');
            }
            // storage full deposit
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
                setState(States.DEPOSIT)(creep);
                creep.say('⬆️ Deposit');
            }
            // deposit energy to storage
            if(creep.memory.state == States.DEPOSIT){
                if(depositToEnergyStorage(creep) == routineResult.FAILURE){
                    buildConstructionSites(creep)
                }
            }
        }
    }
}
