declare global{
    
    /**
     * Distance transform
     * DT infor for each Title in a room
     */
    interface distanceTransform{
        x: number
        y: number
        dist: number
    }

    /**
     * Owned rooms memory
     * add a place to store the distance transform
     */
    interface OwnedRoomsMemory{
        distanceTransform?: Array<distanceTransform>
    }
}

/**
 * Distances transform
 * Creates a distance transform of an inputted room
 * a DT gives you a weighting of tiles from a target in this case walls
 * @param room the room to make a Distance Transform of
 */
export function distanceTransform(room:Room){
    // Scan the whole room
    let roomscan = room.lookAtArea(0,0,50,50,true)
    // Filter tiles by type
    let walls = roomscan.filter((loc) => (loc.type == 'terrain' && loc.terrain == 'wall'))
    let plainsAndSwamps=roomscan.filter((loc) => (loc.type == 'terrain' && (loc.terrain == 'plain' || loc.terrain == 'swamp')))
    let results=[]

    // for each plain and swamp tile
    // search through all wall tiles for the closest wall
    // store the result
    for (let i in plainsAndSwamps){
        let loc = plainsAndSwamps[i]
        let distances = []
        for (let x in walls){
            let wallloc = walls[x]
            // do some math to find out how  far away the tile is from the nearest wall
            let dist = Math.round(Math.sqrt(
                (
                    Math.pow((loc.x - wallloc.x),2)+
                    Math.pow((loc.y - wallloc.y),2)
                )
            ))
            distances.push(dist)
        }
        let closestwall = Math.min.apply(null,distances)
        results.push({x:loc.x,y:loc.y,dist:closestwall})
    }
    // store the map in the rooms memory
    Memory.OwnedRooms[room.name].distanceTransform=results
}