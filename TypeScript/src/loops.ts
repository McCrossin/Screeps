import { runCreepPragmas } from "pragmas/runCreepPragmas";
import { spawnPragmas } from "pragmas/spawnPragmas";
import { roomScanner } from "scanners/roomScanner";
import './pragmas/initPragma'
export function loops() {
    roomScanner()
    for(let id in Game.creeps){
        runCreepPragmas(Game.creeps[id])
    }
    spawnPragmas()
}