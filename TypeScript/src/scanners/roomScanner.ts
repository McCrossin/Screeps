import { spawnSync } from "child_process"
import { object } from "lodash"
import { spawnNames } from "utils/SpawnNames"

export function roomScanner(){

    for (let OwnedRoomId in Memory.OwnedRooms)
        if(!Game.rooms[OwnedRoomId]?.controller?.my){
            delete Memory.OwnedRooms[OwnedRoomId]
    }

    for (let roomId in Game.rooms){

        Memory.OwnedRooms ??= {}
        if(Game.rooms[roomId].controller?.my){
            if(!Memory.OwnedRooms[roomId]){
                
                Memory.OwnedRooms[roomId] = {
                    name: spawnNames.find(name =>!Object.values(Memory.OwnedRooms).some(r => r.name ===name)) ?? roomId,
                }
            }
        }
    }
    
}