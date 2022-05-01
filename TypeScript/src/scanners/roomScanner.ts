import { OwnedRoomPragmas } from "pragmas/ownedRoom"
import { planExtensions, plannedExtensions } from "roomplanner/planExtensions"
import { GenerateRoads } from "roomplanner/roads"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/spawnNames"
import { distanceTransform } from "./distanceTransform"
import { mapRoomSources } from "./SourceScanner"

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
export function roomScanner(): void {
    // Prune the OwnedRooms Memory object and remove and rooms we now dont own
    removeUnownedRooms()
    // Iterate over all rooms in the game
    for (let roomId in Game.rooms) {
        let currentRoom = Game.rooms[roomId]
        // Check if we own the contorller
        if (currentRoom.controller?.my) {
            // name the room randomly
            newRoomName(roomId, currentRoom)
            
            let CurrentRoomMemory = Memory.OwnedRooms[roomId]
            //create a distance transform map
            newDistanceTransform(CurrentRoomMemory, currentRoom)
            // Map Room Sources, location and capacity
            newSourceMap(currentRoom)
            // Plan out the extension map
            newExtensionplan(CurrentRoomMemory, currentRoom)
            /** 
             * Turn pragma off if its too close to enemies
             * Find_Hostile_Power_Creeps
             * If there is a source within 3 tiles of a hostile powercreep turn it off.
            */
            findHostilePowerCreeps(currentRoom)

            // generate road paths to sources if they have been mapped
            newRoaPaths(CurrentRoomMemory,currentRoom)
        }
    }
}

function newRoaPaths(roomMemory:OwnedRoomsMemory,room:Room): void{
    roomMemory.roads ??= []
    if (room.memory.sources.length != 0 && roomMemory.roads.length === 0) {
        console.log(`Planned roads for: ${room.name}`)
        let spawn = (room.find(FIND_MY_SPAWNS))[0]
        for (let sourceID in room.memory.sources) {
            let sourceHash = room.memory.sources[sourceID].id
            let check = roomMemory.roads?.find((road) => (road.id == sourceHash))
            if (check) continue;
            let source = byId(sourceHash)
            if (source) {
                let roadPath = GenerateRoads(room, spawn.pos, source.pos)
                if (roadPath) {
                    roomMemory.roads?.push({ id: sourceHash, PathFinder: roadPath })
                }
                roomMemory.roads?.sort((a, b) => (a.PathFinder.path.length - b.PathFinder.path.length))
                
            }
        }
    }
}

function removeUnownedRooms(): void {
    for (let OwnedRoomId in Memory.OwnedRooms)
        if (!Game.rooms[OwnedRoomId]?.controller?.my) {
            console.log(`Removing ${Game.rooms[OwnedRoomId].name} `)
            delete Memory.OwnedRooms[OwnedRoomId]
        }
}

function findHostilePowerCreeps(room: Room): void {
    let hostileCreepsInRoom = room.find(FIND_HOSTILE_CREEPS)
    for (let i in hostileCreepsInRoom) {
        let unsafeSources = hostileCreepsInRoom[i].pos.findInRange(FIND_SOURCES_ACTIVE, 3)
        for (let j in unsafeSources) {
            let pragmaID = `OwnedRoomPragma|${unsafeSources[j].id}`
            if (OwnedRoomPragmas[pragmaID] != undefined) {
                OwnedRoomPragmas[pragmaID].disabled = true
                //console.log("The following Source has been disabled: " + unsafeSources[j].id)
            }
        }
    }
}

function newExtensionplan(roomMemory: OwnedRoomsMemory, room: Room): void {
    roomMemory.plannedExtensions ??= []
    if (roomMemory.plannedExtensions.length === 0) {
        console.log(`Planned Extension for ${room.name}`)
        roomMemory.plannedExtensions = planExtensions(room)
    }
    if (roomMemory.plannedExtensions != undefined) {
        for (let i of roomMemory.plannedExtensions) {
            room.visual.text(i.closestspawn ? i.closestspawn.toString() : '', i.x, i.y)
        }
    }
}

function newSourceMap(room: Room): void {
    room.memory.sources ??= []
    if (room.memory.sources.length === 0) {
        console.log(`Mapping Sources for: ${room.name}`)
        room.memory.sources ??= []

        mapRoomSources(room)
    }
}

function newDistanceTransform(roomMemory: OwnedRoomsMemory, room: Room): void {
    roomMemory.distanceTransform ??= []
    if (roomMemory.distanceTransform.length === 0) {
        console.log(`Created Distance Transform for: ${room.name}`)
        roomMemory.distanceTransform = distanceTransform(room)
    }
}

function newRoomName(roomName: string, room: Room): void {
    Memory.OwnedRooms ??= {}
    if (!Memory.OwnedRooms[roomName]) {
        console.log(`Adding a new room to Owned Rooms! ${room.name}`)
        Memory.OwnedRooms[roomName] = {
            name: spawnNames.find(name => !Object.values(Memory.OwnedRooms).some(r => r.name === name)) ?? roomName,
        }
    }
}
