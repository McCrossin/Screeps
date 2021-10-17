import { byId } from "selectors/byId";
import { PriorityPragmas } from "./initPragma";

export function spawnPragmas(){
    for (let o of PriorityPragmas){
        o.assigned = o.assigned.filter(c => byId(c)?.memory.Pragma === o.id)
        o.spawn()
    }
}