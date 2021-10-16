import { PriorityPragmas } from "./initPragma";

export function spawnPragmas(){
    for (let o of PriorityPragmas){
        o.spawn()
    }
}