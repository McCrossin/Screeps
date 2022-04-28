import { OwnedRoomPragmas } from "pragmas/ownedRoom"
import { Pragma, Pragmas } from "pragmas/pragma"
import { mapRoomSources } from "roomManagement"
import { GenerateRoads } from "roomplanner/roads"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/spawnNames"
import { distanceTransform } from "./distanceTransform"
import { planExtensions, plannedExtensions } from "roomplanner/planExtensions"
import { Console } from "console"
declare global {
    interface OwnedRoomsMemory {
        // name of the room randomly generated
        name: string 
        // all the planned roads in the room
        roads?: Array<roadPath>
        plannedExtensions?: Array<plannedExtensions>
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
            console.log(`Removing ${Game.rooms[OwnedRoomId].name} `)
            delete Memory.OwnedRooms[OwnedRoomId]
        }
    // Iterate over all rooms in the game
    for (let roomId in Game.rooms) {
        let currentRoom = Game.rooms[roomId]
        let CurrentRoomMemory = Memory.OwnedRooms[roomId]
        // Check if we own the contorller
        if (currentRoom.controller?.my) {
            // name the room randomly
            Memory.OwnedRooms ??= {}
            if (!CurrentRoomMemory) {
                console.log(`Adding a new room to Owned Rooms! ${currentRoom.name}`)
                CurrentRoomMemory = {
                    name: spawnNames.find(name => !Object.values(Memory.OwnedRooms).some(r => r.name === name)) ?? roomId,
                }
            }
            //create a distance transform map
            CurrentRoomMemory.distanceTransform ??= []
            if (!CurrentRoomMemory.distanceTransform) {
                console.log(`Created Distance Transform for: ${currentRoom.name}`)
                CurrentRoomMemory.distanceTransform=distanceTransform(currentRoom)
            }
            // Map Room Sources, location and capacity
            if (!currentRoom.memory.sources) {
                console.log(`Mapping Sources for: ${currentRoom.name}`)
                currentRoom.memory.sources ??= []
                
                mapRoomSources(currentRoom);
            }
            // Plan out the extension map
            CurrentRoomMemory.plannedExtensions ??= []
            if (!CurrentRoomMemory.distanceTransform) {
                console.log(`Planned Extension for ${currentRoom.name}`)
                CurrentRoomMemory.plannedExtensions=planExtensions(currentRoom)
            }
            if(CurrentRoomMemory.plannedExtensions != undefined){
                for (let i of CurrentRoomMemory.plannedExtensions) {
                    currentRoom.visual.text(i.closestspawn ? i.closestspawn.toString() : '',i.x,i.y)
                }
            }
             /**TODO Turn pragma off if its too close to enemies
            Find_Hostile_Power_Creeps
            If there is a source within 3 tiles of a hostile powercreep turn it off.
            */
            let hostileCreepsInRoom = currentRoom.find(FIND_HOSTILE_CREEPS);
            for (let i in hostileCreepsInRoom){
                let unsafeSources = hostileCreepsInRoom[i].pos.findInRange(FIND_SOURCES_ACTIVE, 3);
                for (let j in unsafeSources){
                    let pragmaID = `OwnedRoomPragma|${unsafeSources[j].id}`
                    if(OwnedRoomPragmas[pragmaID] != undefined){
                        OwnedRoomPragmas[pragmaID].disabled=true
                        //console.log("The following Source has been disabled: " + unsafeSources[j].id)
                    }
                }
            }

            // generate road paths to sources if they have been mapped
            CurrentRoomMemory.roads ??= []
            if (currentRoom.memory.sources) {

                let spawn = (currentRoom.find(FIND_MY_SPAWNS))[0]
                for (let sourceID in currentRoom.memory.sources) {
                    let sourceHash = currentRoom.memory.sources[sourceID].id
                    let check = CurrentRoomMemory.roads?.find((road) => (road.id == sourceHash))
                    if (check) continue;
                    let source = byId(sourceHash)
                    if (source) {
                        let roadPath = GenerateRoads(currentRoom, spawn.pos, source.pos)
                        if (roadPath) {
                            CurrentRoomMemory.roads?.push({ id: sourceHash, PathFinder: roadPath })
                        }
                        CurrentRoomMemory.roads?.sort((a, b) => (a.PathFinder.path.length - b.PathFinder.path.length))
                        
                    }
                }
            }
        }
    }

}