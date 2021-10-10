
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

