import { byId } from "selectors/byId";
import { PriorityPragmas } from "./initPragma";

/**
 * Spawns pragmas
 * runs the spawn method on each pragma, by priority
 * Makes sure only creeps with a matching pragma ID are in te assigned property of the pragma
 */
export function spawnPragmas(){
    for (let i of PriorityPragmas){
        i.assigned = i.assigned.filter(c => byId(c)?.memory.Pragma === i.id)
        i.spawn()
    }
}