import { mapRoomSources } from "roomManagement"
import { GenerateRoads } from "roomplanner/roads"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/SpawnNames"
import { distanceTransform } from "./distancetransform"
import { new_graph_from_area } from "./minimumCut"
Memory.OwnedRooms[0].name
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
        id: Id<Source>,
        capacity?: number,
        cost?: number
    }
    interface RoomMemory {
        sources: Array<SourceInfo>;
        Tiles: LookAtResultWithPos<LookConstant>[];
    }
}


export function roomScanner() {

    for (let OwnedRoomId in Memory.OwnedRooms)
        if (!Game.rooms[OwnedRoomId]?.controller?.my) {
            delete Memory.OwnedRooms[OwnedRoomId]
        }

    for (let roomId in Game.rooms) {
        let currentRoom = Game.rooms[roomId]
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

            // generate road paths to sources
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