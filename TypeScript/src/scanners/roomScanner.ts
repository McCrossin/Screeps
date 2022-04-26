import { OwnedRoomPragmas } from "pragmas/OwnedRoom"
import { Pragma, Pragmas } from "pragmas/pragma"
import { mapRoomSources } from "roomManagement"
import { GenerateRoads } from "roomplanner/roads"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/SpawnNames"
import { distanceTransform } from "./distancetransform"

declare global {
    interface OwnedRoomsMemory {
        // name of the room randomly generated
        name: string 
        // all the planned roads in the room
        roads?: Array<roadPath>
    }
    interface roadPath {
        // Generated path finder object contains all the xy coords for the path
        PathFinder: PathFinderPath
        // road id
        id: string
    }
    interface SourceInfo {
        // ID of the source object
        id: Id<Source>,
        // Energy capacity
        capacity?: number,
        // how far away is it from the spawn
        cost?: number
    }
    interface RoomMemory {
        // list of all sources in a room
        sources: Array<SourceInfo>;
        // all tile information in a room
        Tiles: LookAtResultWithPos<LookConstant>[];
    }
}


/**
 * Rooms scanner
 * Scans rooms and records useful information for later use
 */
export function roomScanner() {
    // Prune the OwnedRooms Memory object and remove and rooms we now dont own
    for (let OwnedRoomId in Memory.OwnedRooms)
        if (!Game.rooms[OwnedRoomId]?.controller?.my) {
            delete Memory.OwnedRooms[OwnedRoomId]
        }
    // Iterate over all rooms in the game
    for (let roomId in Game.rooms) {
        let currentRoom = Game.rooms[roomId]
        // Check if we own the contorller
        if (currentRoom.controller?.my) {
            // name the room randomly
            Memory.OwnedRooms ??= {}
            if (!Memory.OwnedRooms[roomId]) {
                
                Memory.OwnedRooms[roomId] = {
                    name: spawnNames.find(name => !Object.values(Memory.OwnedRooms).some(r => r.name === name)) ?? roomId,
                }
            }
            //create a distance transform map
            Memory.OwnedRooms[roomId].distanceTransform ??= []
            if (!Memory.OwnedRooms[roomId].distanceTransform) {
                distanceTransform(currentRoom)
            }
            // Map Room Sources, location and capacity
            if (!currentRoom.memory.sources) {
                currentRoom.memory.sources ??= []
                mapRoomSources(currentRoom);
            }
            // Min cut play
            //new_graph_from_area(currentRoom.lookAtArea(0,16,16,35,true),currentRoom)

             /**TODO Turn pragma off if its too close to enemies
            Find_Hostile_Power_Creeps
            If there is a source within 3 tiles of a hostile powercreep turn it off.
            */
            let hostileCreepsInRoom = currentRoom.find(FIND_HOSTILE_CREEPS);
            for (let i in hostileCreepsInRoom){
                let unsafeSources = hostileCreepsInRoom[i].pos.findInRange(FIND_SOURCES_ACTIVE, 3);
                for (let j in unsafeSources){
                    let pragmaID = `OwnedRoomPragma|${unsafeSources[j].id}`
                    let pragma = OwnedRoomPragmas[pragmaID]
                    if(pragma != undefined){
                        OwnedRoomPragmas[pragmaID].disabled=true
                    }
                }
            }

            // generate road paths to sources if they have been mapped
            Memory.OwnedRooms[roomId].roads ??= []
            if (currentRoom.memory.sources) {

                let spawn = (currentRoom.find(FIND_MY_SPAWNS))[0]
                for (let sourceID in currentRoom.memory.sources) {
                    let sourceHash = currentRoom.memory.sources[sourceID].id
                    let check = Memory.OwnedRooms[roomId].roads?.find((road) => (road.id == sourceHash))
                    if (check) continue;
                    let source = byId(sourceHash)
                    if (source) {
                        let roadPath = GenerateRoads(currentRoom, spawn.pos, source.pos)
                        if (roadPath) {
                            Memory.OwnedRooms[roomId].roads?.push({ id: sourceHash, PathFinder: roadPath })
                        }
                        Memory.OwnedRooms[roomId].roads?.sort((a, b) => (a.PathFinder.path.length - b.PathFinder.path.length))
                        
                    }
                }
            }
        }
    }

}