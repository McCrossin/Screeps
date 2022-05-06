import { setState, States } from "routine/states";
import { byId } from "selectors/byId";
import { isCreep } from "selectors/typeGuards";

export const Pragmas: Record<string,Pragma> = {}

declare global {

    /**
     * Creep memory
     * Add properties to a screeps memory to store pragma info
     */
    interface CreepMemory {
        Pragma?: string
        OwnedRoom:string
    }
}

/**
 * Pragma
 * abstract Class that all pragmas are based off
 */
export abstract class Pragma {
    public id: string


    protected _indexer(c: Creep){
        return c.memory.OwnedRoom
    }
    // array of assigned creeps to the pragma
    public assigned: Id<Creep>[] = [];
    
    constructor(public priority: number =5){
        this.id=this.constructor.name
    }
    
    /**
     * Actions pragma
     * executes a set of actions / routines that are defined
     * @param creep creep to execute the action on
     */
    abstract action(creep:Creep):void

    
    /**
     * Spawns pragma
     * Conditions that determine if the pragma should spawn creeps
     */
    abstract spawn(): void

    private _workers = new Map<string, Id<Creep>[]>();
    private _lastWorkerCount = 0;
    
    public minions(index: string) {
        // Re-index assigned minions when the count changes
        if (this.assigned.length !== this._lastWorkerCount) {
            this._lastWorkerCount = this.assigned.length;
            this._workers = new Map<string, Id<Creep>[]>();

            for (let creep of this.assigned.map(byId)) {
                if (creep) {
                    let i = this._indexer(creep);
                    this._workers.set(i, (this._workers.get(i) ?? []).concat(creep.id));
                }
            }
        }
        return (this._workers.get(index) ?? []).map(byId).filter(isCreep)
    }

    public setCreepInitialState(creep: Creep) {
        if (!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            setState(States.GET_ENERGY)(creep);
            creep.say('🔄 harvest');
        }
    }    
}