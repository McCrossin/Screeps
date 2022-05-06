import { stringify } from "querystring";
import { roles, RoleTypes } from "roles/roleTypes";
import { spawnRole } from "roles/spawnRole";
import { buildConstructionSites } from "routine/buildconstrucionsites";
import { depositToEnergyStorage, transferEnergyToStructure } from "routine/depositToEnergyStorage";
import { getEnergyFromContainer, getEnergyFromSource } from "routine/getEnergyFromSource";
import { buildingStatus, routineResult } from "routine/routineResult";
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
        
        let carry=this.assigned.filter((a)=>{
            let c = byId(a)
            if(c != undefined){return c.memory.role === RoleTypes.T2_Carry}
            return})
        let container = this.getSourceContainer()
        if(carry.length <= 2 && container != undefined && container.store.energy > 50){
            spawnRole(
                this.OwnedRoom,
                this.id,
                RoleTypes.T2_Carry,
                roles[RoleTypes.T2_Carry](Game.rooms[this.OwnedRoom].energyAvailable)
            )
        }        
        
        let maxCreeps = Memory.OwnedRooms[this.OwnedRoom].sources.find(source => (source.id == this.sourceId))?.capacity
        if(!maxCreeps) maxCreeps = 1
        let Tier1 = this.assigned.filter((a)=>{
            let c = byId(a)
            if(c != undefined){return c.memory.role === RoleTypes.T1}
            return})
        if(Tier1.length < maxCreeps){
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
            this.setCreepInitialState(creep);
            let result = getEnergyFromSource(creep,this.OwnedRoom,this.sourceId,true)
            // storage full deposit
            if (result == routineResult.SUCCESS){
                setState(States.DEPOSIT)(creep);
                creep.say('⬆️ Deposit');
            }
            // deposit energy to storage
            if(creep.memory.state == States.DEPOSIT){
                if(this.containerDeposit(creep) == routineResult.FAILURE){
                    if(depositToEnergyStorage(creep) == routineResult.FAILURE){
                        buildConstructionSites(creep)
                    }
                }
            }
        }
        if(creep.memory.role === RoleTypes.T2_Carry){
            this.setCreepInitialState(creep);
            switch (creep.memory.state) {
                case States.GET_ENERGY:
                    let container = this.getSourceContainer()
                    if(container != undefined){
                        let r = getEnergyFromContainer(creep,container?.id)
                        if(r == routineResult.SUCCESS) setState(States.DEPOSIT)(creep)                    
                    }
                    break;
                case States.DEPOSIT:
                    if(depositToEnergyStorage(creep) == routineResult.SUCCESS){
                        setState(States.GET_ENERGY)(creep)
                    }
                    break;
            }
        }
        if(creep.memory.role === RoleTypes.T1){
            this.setCreepInitialState(creep);
            let result = getEnergyFromSource(creep,this.OwnedRoom,this.sourceId,true)
            // storage full deposit
            if (result == routineResult.SUCCESS){
                setState(States.DEPOSIT)(creep);
                creep.say('⬆️ Deposit');
            }
            // deposit energy to storage
            if(creep.memory.state == States.DEPOSIT){
                if(this.containerDeposit(creep) == routineResult.FAILURE){
                    if(depositToEnergyStorage(creep) == routineResult.FAILURE){
                        buildConstructionSites(creep)
                    }
                }
            }
        }
    }

    private containerDeposit(creep: Creep) {
        let container = this.getSourceContainer();
        if (container != undefined) {
            console.log("Foundcontainer")
            return transferEnergyToStructure(creep, container);
        }
        return routineResult.FAILURE
    }

    private getSourceContainer() {
        let container = Memory.OwnedRooms[this.OwnedRoom].sources.find((a)=>{return a.id == this.sourceId})?.container;
        if (container?.id != undefined && container.status == buildingStatus.COMPLETE) {
            let containerObj = byId(container.id)
            if(containerObj != undefined) return containerObj as StructureContainer
        }
        return undefined 
    }
}
