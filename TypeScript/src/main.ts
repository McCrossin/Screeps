import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "roles/harvester";
import { roleBuilder } from "roles/builder";
import { roleUpgrader } from "roles/upgrader";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    building: boolean;

  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  var harvesters = _.filter(Game.creeps, (creep:Creep) => creep.memory.role == 'Harvester');

  if(harvesters.length < 2) {
    var newName = 'Harvester' + harvesters.length;
    Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
      {memory: {role: 'Harvester',room:'Spawn1',building:false}});
  }

  for(const name in Game.creeps){

    var creep = Game.creeps[name];

    if(creep.memory.role == "Harvester"){
      roleHarvester(creep);
    }
    if(creep.memory.role == "Builder"){
      roleBuilder(creep);
    }
    if(creep.memory.role == "Upgrader"){
      roleUpgrader(creep);
    }        
  }

  // Automatically delete memory of missing creeps
  if(Game.time % 100 === 0) {
    console.log("Clearing");
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }}
});

