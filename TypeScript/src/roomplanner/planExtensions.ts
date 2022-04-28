import { Position } from "source-map"

enum cardinalDirection{
    left = 'x',
    right = 'x',
    top = 'y',
    bottom = 'y'
}

export function planExtensions(room:Room,dir:cardinalDirection=cardinalDirection.left){
    // For now this will plan based on out spawn
    let spawns = room.find(FIND_MY_SPAWNS)

    if (spawns.length > 0) {
        let spawn = spawns[0]
        let spawnOffset = 2
        let bankLength = 10
        let plannedRoad:Array<RoomPosition> = []
        let SpawnDirection = spawn.pos[dir]

        for (let currentOffset = SpawnDirection-spawnOffset; currentOffset > SpawnDirection - bankLength; currentOffset--) {
            
            plannedRoad.push(new RoomPosition(currentOffset,spawn.pos.y,room.name))
            room.visual.circle(currentOffset,spawn.pos.y,{fill:"blue"})
        }


    }

}