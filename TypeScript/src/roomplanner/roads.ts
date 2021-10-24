import path from "path"

export function GenerateRoads(room:Room,origin:RoomPosition,goal:RoomPosition){

    let cm =  PathFinder.search(
        origin,
        {pos:goal, range:1},
        {
            maxRooms:1
        }
    )
    if(cm.incomplete){
        return false
    }
    for(let i in cm.path){
        let location=cm.path[i]
        room.createConstructionSite(
            location.x,
            location.y,
            STRUCTURE_ROAD
        )
    }
    return cm
}