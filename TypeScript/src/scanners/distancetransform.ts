declare global{
    interface distanceTransform{
        x: number
        y: number
        dist: number
    }
    interface OwnedRoomsMemory{
        distanceTransform?: Array<distanceTransform>
    }
}

export function distanceTransform(room:Room){
    let roomscan = room.lookAtArea(0,0,50,50,true)
    let walls = roomscan.filter((loc) => (loc.type == 'terrain' && loc.terrain == 'wall'))
    let plainsAndSwamps=roomscan.filter((loc) => (loc.type == 'terrain' && (loc.terrain == 'plain' || loc.terrain == 'swamp')))
    let results=[]
    for (let i in plainsAndSwamps){
        let loc = plainsAndSwamps[i]
        let distances = []
        for (let x in walls){
            let wallloc = walls[x]
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
    Memory.OwnedRooms[room.name].distanceTransform=results
}