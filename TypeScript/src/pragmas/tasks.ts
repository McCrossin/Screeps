export class TaskRequest {
    task!: TaskAction;
    status!: "PENDING"|"INPROCESS"|"COMPLETE";
}

export class TaskAction {
    prereqs!: TaskPrerequisite[];
    action!: (creep:Creep,...args:any) => boolean; // Action complete?
}

export class TaskPrerequisite {
    meets!: (creep:Creep) => boolean; // Does minion meet prerequisite?
    toMeet!: (creep:Creep) => TaskAction[]; // What would it take for minion to meet prerequisite?

}

export class MinionCanWork extends TaskPrerequisite{
        meets = (creep: Creep) => (creep.getActiveBodyparts(WORK) > 0);
        toMeet= (creep: Creep) => ([]);
}

export class MinionHasEnergy extends TaskPrerequisite {
    meets=(creep:Creep) => (creep.store.getUsedCapacity() > 0)
    toMeet=(creep:Creep) => {
                if(creep.store.getCapacity() === 0)return []
                return []
    }
}

export class BuildAction extends TaskAction {
    constructor(){
        super()
        this.prereqs= [
            new MinionCanWork(),
            new MinionHasEnergy(),
            //new MinionIsNear(this.site.pos, 3)
        ];
        this.action = (creep: Creep,ConstructionSite:ConstructionSite) => {
            if (creep.build(ConstructionSite) !== OK) {
                return true; // Unable to build, end task
            }
            return false; // Task is not complete
        }
    }
}

export class UpgradeControllerAction extends TaskAction {
    controller: StructureController
    constructor(controller:StructureController){
        super()
        this.controller=controller
    }
    prereqs= [
        new MinionCanWork(),
        new MinionHasEnergy(),
        //new MinionIsNear(this.site.pos, 3)
    ];    
    action = (creep:Creep) => {
        let i=creep.upgradeController(this.controller)
        if (i == ERR_NOT_IN_RANGE) {
            creep.moveTo(this.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            return true; // Unable to build, end task
        }else{
            return false; // Task is not complete
        }
    }    
}

export class MoveAction extends TaskAction {
    destination: RoomPosition;
    cost: (creep: Creep) => number;
    distance: number;
    constructor(RoomPos:RoomPosition,distance:number) {
        super()
        this.destination= RoomPos;
        this.distance=distance
        this.cost = (creep: Creep) => {
            return creep.pos.getRangeTo(this.destination);
        }
    }
    prereqs= [];
    action = (creep: Creep) => {
        let result = creep.moveTo(this.destination);
        if (result === ERR_NO_PATH ||
            result === ERR_NOT_OWNER ||
            result === ERR_NO_BODYPART ||
            result === ERR_INVALID_TARGET) return true; // Unrecoverable error
        return creep.pos.inRangeTo(this.destination, this.distance);
    }    
}

export class HarvestAction extends TaskAction {
    prereqs=[new MinionCanWork()]
    action = (creep:Creep, source:Source) => {
        let result = creep.harvest(source)
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            return true;
        }
        return false
    }    
}