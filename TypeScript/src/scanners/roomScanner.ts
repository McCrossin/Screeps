import { OwnedRoomPragmas } from "pragmas/ownedRoom"
import { planExtensions, plannedExtensions } from "roomplanner/planExtensions"
import { GenerateRoads } from "roomplanner/roads"
import { construcitonSitePriority } from "routine/buildconstrucionsites"
import { buildingStatus } from "routine/routineResult"
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
        sources: Array<SourceInfo>;
        containersSetup?:boolean
    }
    interface container{
        pos:RoomPosition
        status:buildingStatus
        id?:Id<Structure<StructureConstant>>

    }
    interface SourceInfo {
        // ID of the source object
        id: Id<Source>,
        // Energy capacity
        capacity?: number,
        // how far away is it from the spawn
        cost?: number
        road?:PathFinderPath
        container?:container
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
                if(currentRoom.controller.level >= 2){
                    // Plan out the extension map
                    newExtensionplan(currentRoomMemory, currentRoom)
                    // Plan and place containers
                    let struc = currentRoom.find(FIND_STRUCTURES)
                    let ext = struc.filter((a)=>{return a.structureType == STRUCTURE_EXTENSION})
                    let con = struc.filter((a)=>{return a.structureType == STRUCTURE_CONTAINER})
                    if(!(con.length > 1) || ext.length > 5){
                        newSourceContainer(currentRoomMemory,currentRoom)
                    }

                }
                //create a distance transform map
                newDistanceTransform(currentRoomMemory, currentRoom)
                // Map Room Sources, location and capacity
                newSourceMap(currentRoomMemory,currentRoom)
                // generate road paths to sources if they have been mapped
                newRoadPaths(currentRoomMemory,currentRoom)
                // Place extension construction sites.
                newExtensionConstructionSites(currentRoomMemory,currentRoom)
                // Place Container
                prioritiseConstructionSites(currentRoomMemory,currentRoom)

            }
        }
    }
}

function newSourceContainer(roomMemory:OwnedRoomMemory,room:Room): void{
    roomMemory.containersSetup ??=false
    if(roomMemory.containersSetup == true) return
    // Sort sources by there cost && filter out complete sources
    let sortedSources = roomMemory.sources.sort((a,b)=>{return (a.cost != undefined && b.cost != undefined) ? (a.cost - b.cost) : 0}).filter((a)=>{return a.container?.status != buildingStatus.COMPLETE})
    if(sortedSources[0].container != undefined && sortedSources[0].container.status != buildingStatus.INPROGRESS){
        sortedSources[0].container.status = buildingStatus.INPROGRESS
    }else if(sortedSources.length == 0){roomMemory.containersSetup=true}
    for (const s of roomMemory.sources) {
        // This is dependent on the roads to sources being planned
        let loc = s.road?.path[s.road?.path.length-1]
        if(loc == undefined){continue}
        // Plan out a container
        s.container ??= {pos:new RoomPosition(loc.x,loc.y,room.name),status:buildingStatus.PLANNED}
        // dont place the consturction site till the building status is set to INPROGRESS
        if(s.container.status != buildingStatus.INPROGRESS) continue
        let plannedLoc = room.lookAt(s.container.pos.x,s.container.pos.y)
        let building:LookAtResult|undefined = plannedLoc.find((a)=>{return a.type === LOOK_CONSTRUCTION_SITES || a.type === LOOK_STRUCTURES})
        // Place a container construction site if something else is placed
        if(building?.constructionSite?.structureType != STRUCTURE_CONTAINER && building?.constructionSite?.structureType == STRUCTURE_ROAD){
            building?.constructionSite?.remove()
            room.createConstructionSite(s.container.pos.x,s.container.pos.y,STRUCTURE_CONTAINER)
        }
        // Set inprogess if a container construction site is present
        else if(building?.constructionSite?.structureType == STRUCTURE_CONTAINER) s.container.status = buildingStatus.INPROGRESS
        // If a building already exists and its not a container remove
        else if(building?.structure?.structureType != STRUCTURE_CONTAINER && building?.structure?.structureType == STRUCTURE_ROAD){
            building?.structure?.destroy()
            room.createConstructionSite(s.container.pos.x,s.container.pos.y,STRUCTURE_CONTAINER)
        }
        // If a container is built here then mark as complete
        else if(building?.structure?.structureType == STRUCTURE_CONTAINER){
            s.container.status = buildingStatus.COMPLETE
            s.container.id = building.structure.id}
        else{
            room.createConstructionSite(s.container.pos.x,s.container.pos.y,STRUCTURE_CONTAINER)
        }
    }
}

function getDamagedStructures(roomMemory:OwnedRoomMemory,room:Room){

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

function newExtensionConstructionSites(RoomMemory:OwnedRoomMemory,room:Room):void{
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
