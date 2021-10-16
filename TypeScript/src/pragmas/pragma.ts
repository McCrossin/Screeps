import { byId } from "selectors/byId";
import { isCreep } from "selectors/typeGuards";

export const Pragmas: Record<string,Pragma> = {}

declare global {
    interface CreepMemory {
        Pragma?: string
        OwnedRoom:string
    }
}

export abstract class Pragma {
    public id: string


    protected _indexer(c: Creep){
        return c.memory.OwnedRoom
    }
    public assigned: Id<Creep>[] = [];
    constructor(){
        this.id=this.constructor.name
    }

    abstract action(creep:Creep):void

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
}