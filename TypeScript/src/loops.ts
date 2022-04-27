import { initDynamicPragmas } from "pragmas/initDynamicPragmas";
import { OwnedRoomPragmas } from "pragmas/OwnedRoom";
import { runCreepPragmas } from "pragmas/runCreepPragmas";
import { spawnPragmas } from "pragmas/spawnPragmas";
import { roomScanner } from "scanners/roomScanner";
import { byId } from "selectors/byId";
import { Position } from "source-map";
import { drawSpawnStrucUI } from "UI/drawUI";
import './pragmas/initPragma'

export function loops() {
    /**
     * Sets up Dynamic Pragmas for owned rooms
     * Owned Rooms.ts currently controls this
     * This will currently try to spawn a screep for each source and transfer energy to the spawn
     * TODO DynamicPragmas This needs work!
     */
    for(let ownedRoomId in Memory.OwnedRooms){
        initDynamicPragmas(ownedRoomId)
    }
    
    /**
     * roomScanner is used to recon new rooms and gather useful information about them
     * Distance transform map, location of source's, do we own the room etc
     * This data is stored in memory > OwnedRooms
     */
    roomScanner()

    /**
     * Each Creep on spawn is assigned a pragma in memory > Pragma
     * This is the name of the Pragma object in the Pragmas array (pragma.ts)
     * Assuming the creep is assigned one which it 
     * should the action function of the pragma will get called
     * 
     */
    for(let id in Game.creeps){
        runCreepPragmas(Game.creeps[id])
    }
    
    /**
     * Uses the PriorityPragmas array (pragmas array sorted by priority)
     * to execute all contained pragmas .spawn() methods in that order
     * This is the method that will spawn minions in owned rooms and assign
     * them their birth pragma
     */
    spawnPragmas()
    /**
     * Some Coloring for sources to display some information
     */
    for (let room in Memory.OwnedRooms) {
        for(let ORPragma in OwnedRoomPragmas){
            let e = OwnedRoomPragmas[ORPragma]
            let source  = byId(e.sourceId)
            if (source != undefined) {
                let color = e.disabled ? "red" : "white"
                let pos = new RoomPosition(source.pos.x,source.pos.y+1,source.pos.roomName)
                Game.rooms[room].visual.text(
                    `Distance: ${e.distance}\r\nPriority: ${e.priority}`,
                    pos,
                    {color:color})
            } 
        }
    }
    /**
     * Draws Spawn Power GUI element
     */
    for(let i in Game.spawns){
        drawSpawnStrucUI(Game.spawns[i], Game.spawns[i].room.energyAvailable, Game.spawns[i].room.energyCapacityAvailable)
    }
}