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
export function distanceTransform(room:Room,top:number=0,left:number=0,bottom:number=0,right:number=0){
    // Scan the whole room
    if (top == 0 && left == 0 && bottom == 0 && right == 0) {
        top = 0
        left = 0
        bottom = 50
        right = 50
    }
    let roomscan = room.lookAtArea(top,left,bottom,right,true)    
    
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
            distances.push(calcDstBetweenPoints(loc.x,loc.y,wallloc.x,wallloc.y))
        }
        let closestwall = Math.min.apply(null,distances)
        results.push({x:loc.x,y:loc.y,dist:closestwall})
    }
    // store the map in the rooms memory
    return results
}

/**
 * Calculates the Distance Between two X Y Co-ordinates
 * √[(x₂ - x₁)² + (y₂ - y₁)²]
 * @param p1_x 
 * @param p1_y 
 * @param p2_x 
 * @param p2_y 
 * @returns  
 */
export function calcDstBetweenPoints(p1_x:number,p1_y:number, p2_x: number,p2_y: number) {
    return Math.round(Math.sqrt(
        (
            Math.pow((p1_x - p2_x), 2) +
            Math.pow((p1_y - p2_y), 2)
        )
    ))
}
