import { initDynamicPragmas } from "pragmas/initDynamicPragmas";
import { runCreepPragmas } from "pragmas/runCreepPragmas";
import { spawnPragmas } from "pragmas/spawnPragmas";
import { roomScanner } from "scanners/roomScanner";
import { drawUI } from "UI/drawUI";
import './pragmas/initPragma'
import { PriorityPragmas } from "./pragmas/initPragma";

export function loops() {
    
    roomScanner()

    for(let ownedRoomId in Memory.OwnedRooms){
        initDynamicPragmas(ownedRoomId)
    }

    for(let id in Game.creeps){
        runCreepPragmas(Game.creeps[id])
    }
    spawnPragmas()

    for(let i in Game.spawns){
        drawUI(Game.spawns[i], Game.spawns[i].room.energyAvailable, Game.spawns[i].room.energyCapacityAvailable)
    }
}