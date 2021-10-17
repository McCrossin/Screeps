import { initDynamicPragmas } from "pragmas/initDynamicPragmas";
import { runCreepPragmas } from "pragmas/runCreepPragmas";
import { spawnPragmas } from "pragmas/spawnPragmas";
import { roomScanner } from "scanners/roomScanner";
import './pragmas/initPragma'
export function loops() {
    
    roomScanner()

    for(let ownedRoomId in Memory.OwnedRooms){
        initDynamicPragmas(ownedRoomId)
    }

    for(let id in Game.creeps){
        runCreepPragmas(Game.creeps[id])
    }
    spawnPragmas()
}