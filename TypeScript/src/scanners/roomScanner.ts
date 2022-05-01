import { OwnedRoomPragmas } from "pragmas/ownedRoom"
import { planExtensions, plannedExtensions } from "roomplanner/planExtensions"
import { GenerateRoads } from "roomplanner/roads"
import { construcitonSitePriority } from "routine/buildconstrucionsites"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/spawnNames"
import { distanceTransform } from "./distanceTransform"
import { mapRoomSources } from "./SourceScanner"
declare global {
    interface OwnedRoomMemory {
        // name of the room randomly generated
        name: string
        plannedExtensions?: Array<plannedExtensions>
        builtextension?: Array<RoomPosition>
        priorityConstructionSites?:Array<ConstructionSite<BuildableStructureConstant>>
        plannedSourceContainers?:{[name:Id<Source>]:RoomPosition}
        sources: Array<SourceInfo>;
    }
    interface SourceInfo {
        // ID of the source object
        id: Id<Source>,
        // Energy capacity
        capacity?: number,
        // how far away is it from the spawn
        cost?: number
        road?:PathFinderPath
    }
    interface RoomMemory {
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
        if (currentRoom.controller?.my != undefined) {
            // name the room randomly
            newRoomName(roomId, currentRoom)
            
            let currentRoomMemory = Memory.OwnedRooms[roomId]
            /** 
             * Turn pragma off if its too close to enemies
             * Find_Hostile_Power_Creeps
             * If there is a source within 3 tiles of a hostile powercreep turn it off.
            */
            findHostilePowerCreeps(currentRoom)
            
            if(Game.time % 10){
                //create a distance transform map
                newDistanceTransform(currentRoomMemory, currentRoom)
                // Map Room Sources, location and capacity
                newSourceMap(currentRoomMemory,currentRoom)
                // Plan out the extension map
                newExtensionplan(currentRoomMemory, currentRoom)
                // generate road paths to sources if they have been mapped
                newRoadPaths(currentRoomMemory,currentRoom)
                // Place extension construction sites.
                newExtensionConsturctionSites(currentRoomMemory,currentRoom)
                prioritiseConstructionSites(currentRoomMemory,currentRoom)

            }
        }
    }
}

function newSourceContainer(roomMemory:OwnedRoomMemory,room:Room){

}

function prioritiseConstructionSites(roomMemory:OwnedRoomMemory,room:Room):void{
    
    let site =  room.find(FIND_CONSTRUCTION_SITES)
    site.sort((a,b)=>
    {
        let aa =construcitonSitePriority[a.structureType]
        let bb =construcitonSitePriority[b.structureType]
        if(bb != undefined && aa != undefined){
            return bb - aa
        }else{
            return 0
        }
    })
    roomMemory.priorityConstructionSites = site
}

function newExtensionConsturctionSites(RoomMemory:OwnedRoomMemory,room:Room):void{
    RoomMemory.builtextension ??= []
    if(!room.controller?.my) return
    if(RoomMemory.builtextension.length < 5 && room.controller.level >= 2){
        let closest = RoomMemory.plannedExtensions?.sort((a,b) =>{
            if (a.closestspawn == undefined || b.closestspawn == undefined) return 1
            return a.closestspawn - b.closestspawn
        })
        if (closest == undefined) return
        let total = 5
        for (let i = 0; i < total; i++) {
            const e = closest[i];

            let r = room.createConstructionSite(
                e.x,
                e.y,
                STRUCTURE_EXTENSION
            )
            if(r == ERR_INVALID_TARGET) {
                total += 1
            }else{
                RoomMemory.builtextension.push(new RoomPosition(e.x,e.y,room.name))
            }
        }
    }
}

function newRoadPaths(roomMemory:OwnedRoomMemory,room:Room): void{
    roomMemory.sources ??= []
    let spawn = (room.find(FIND_MY_SPAWNS))[0]
    for (let sourceMemory of roomMemory.sources) {
        if (sourceMemory.road == undefined){
            console.log(`Planned roads for: ${room.name}`)
            let sourceHash = sourceMemory.id
            let source = byId(sourceHash)
            if (source) {
                let roadPath = GenerateRoads(room, spawn.pos, source.pos)
                if (roadPath) {
                    sourceMemory.road = roadPath
                }                
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

function newExtensionplan(roomMemory: OwnedRoomMemory, room: Room): void {
    roomMemory.plannedExtensions ??= []
    if (roomMemory.plannedExtensions.length === 0) {
        console.log(`Planned Extension for ${room.name}`)
        roomMemory.plannedExtensions = planExtensions(room)
    }
}

function newSourceMap(roomMemory: OwnedRoomMemory,room: Room): void {
    roomMemory.sources ??= []
    if (roomMemory.sources.length === 0) {
        console.log(`Mapping Sources for: ${room.name}`)
        mapRoomSources(room)
    }
}

function newDistanceTransform(roomMemory: OwnedRoomMemory, room: Room): void {
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
        Memory.OwnedRooms[roomName] = { sources: [],
            name: spawnNames.find(name => !Object.values(Memory.OwnedRooms).some(r => r.name === name)) ?? roomName,
        }
    }
}
