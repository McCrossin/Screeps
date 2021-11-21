
import { mapRoomSources } from "roomManagement"
import { GenerateRoads } from "roomplanner/roads"
import { byId } from "selectors/byId"
import { spawnNames } from "utils/SpawnNames"
import { distanceTransform } from "./distancetransform"
import { MakeRoomGraph2 } from "./minimumCut"

declare global {
    interface OwnedRoomsMemory {
        roads?:Array<roadPath>
    }
    interface roadPath{
        PathFinder: PathFinderPath
        id: string
    }
    interface SourceInfo {
        id: Id<Source>,
        capacity?: number,
        cost?: number
    }
    interface RoomMemory {
        sources: Array<SourceInfo>;
    }
}


export function roomScanner(){

    for (let OwnedRoomId in Memory.OwnedRooms)
        if(!Game.rooms[OwnedRoomId]?.controller?.my){
            delete Memory.OwnedRooms[OwnedRoomId]
    }

    for (let roomId in Game.rooms){
        let currentRoom=Game.rooms[roomId]
        if(currentRoom.controller?.my){
            // name the room randomly
            Memory.OwnedRooms ??= {}
            if(!Memory.OwnedRooms[roomId]){
                
                Memory.OwnedRooms[roomId] = {
                    name: spawnNames.find(name =>!Object.values(Memory.OwnedRooms).some(r => r.name ===name)) ?? roomId,
                }
            }
            //create a distance transform map
            Memory.OwnedRooms[roomId].distanceTransform ??= []
            if(!Memory.OwnedRooms[roomId].distanceTransform){
                distanceTransform(currentRoom)
            }
            // Map Room Sources, location and capacity
            if(!currentRoom.memory.sources){
                currentRoom.memory.sources ??=[]
                mapRoomSources(currentRoom);
              }
            MakeRoomGraph2(currentRoom)
            // generate road paths to sources
            Memory.OwnedRooms[roomId].roads ??=[]
            if(currentRoom.memory.sources){

                let spawn = (currentRoom.find(FIND_MY_SPAWNS))[0]
                for(let sourceID in currentRoom.memory.sources){
                    let sourceHash=currentRoom.memory.sources[sourceID].id
                    let check = Memory.OwnedRooms[roomId].roads?.find((road) => (road.id == sourceHash))
                    if (check) continue;
                    console.log(check)
                    let source = byId(sourceHash)
                    if(source){
                        let roadPath = GenerateRoads(currentRoom,spawn.pos,source.pos)
                        if(roadPath){
                            Memory.OwnedRooms[roomId].roads?.push({id:sourceHash,PathFinder:roadPath})
                        }
                        Memory.OwnedRooms[roomId].roads?.sort((a,b) => (a.PathFinder.path.length - b.PathFinder.path.length))
                    }
                }
            }
        }
    }
    
}