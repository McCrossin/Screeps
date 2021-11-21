import { byId } from "selectors/byId";
import { PriorityPragmas } from "./initPragma";

export function spawnPragmas(){
    for (let i of PriorityPragmas){
        i.assigned = i.assigned.filter(c => byId(c)?.memory.Pragma === i.id)
        i.spawn()
    }
}