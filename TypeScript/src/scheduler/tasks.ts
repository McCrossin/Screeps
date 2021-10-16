class TaskRequest {
    task!: TaskAction;
    status!: "PENDING"|"INPROCESS"|"COMPLETE";
}
class TaskAction {
    prereqs!: TaskPrerequisite[];
    action!: (creep: Creep) => boolean; // Action complete?
}
class TaskPrerequisite {
    meets!: (creep: Creep) => boolean; // Does minion meet prerequisite?
    toMeet!: (creep: Creep) => TaskAction[]; // What would it take for minion to meet prerequisite?

}
class MinionCanWork extends TaskPrerequisite{
    constructor(creep:Creep){
        super();
        this.meets=(creep: Creep) => (creep.getActiveBodyparts(WORK) > 0);
        this.toMeet=(creep: Creep) => ([]);
    }
}

class MinionHasEnergy extends TaskPrerequisite {
    constructor(creep:Creep){
        super()
        this.meets=(creep:Creep) => (creep.store.getUsedCapacity() > 0)
        this.toMeet=(creep:Creep) => {
            if(creep.store.getCapacity() === 0)return []
            return []
        }
    }
}

class BuildAction extends TaskAction {
    site: ConstructionSite
    constructor(creep:Creep,ConstructionSite:ConstructionSite){
        super()
        this.site= ConstructionSite;
        this.prereqs= [
            new MinionCanWork(creep),
            new MinionHasEnergy(creep),
            //new MinionIsNear(this.site.pos, 3)
        ];
        this.action = (creep: Creep) => {
            if (creep.build(this.site) !== OK) {
                return true; // Unable to build, end task
            }
            return false; // Task is not complete
        }
    }
}