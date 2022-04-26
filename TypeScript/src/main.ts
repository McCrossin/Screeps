import { ErrorMapper } from "utils/errorMapper";
import {loops} from "loops"
declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  /**
   * GLobal Memory object,
   * added a Owned Rooms property to store room specific info
   */
  interface Memory {
    uuid: number;
    log: any;
    OwnedRooms: {[name:string]:OwnedRoomsMemory}
  }
  
  interface CreepMemory {
    role: string;
    room?: string;
    building?: boolean;
    upgrading?: boolean;
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
  /**
   * Calls the main game loops
   */
  loops()
});

