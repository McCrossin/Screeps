export function mapRoomSources(room:Room){
    let sources = room.find(FIND_SOURCES);
    
    for(let i in sources){

        let capacity=0

        let source = sources[i];
        var objects = room.lookForAtArea(
            LOOK_TERRAIN,
            source.pos.y-1,
            source.pos.x-1,
            source.pos.y+1,
            source.pos.x+1,true
        )
        
        for (let i in objects) {
            let object = objects[i]
            if(object.type == "terrain"){
                if(object.terrain != 'wall'){
                    capacity++
                }
            }
        }
        let roomSourceInfo=Memory.OwnedRooms[room.name].sources
        
        let exists = roomSourceInfo.findIndex((SourceInfo:SourceInfo) => {return SourceInfo.id == source.id})

        if(exists != -1){
            roomSourceInfo[exists]={id:source.id,capacity:capacity}
        }else{
            roomSourceInfo.push({id:source.id,capacity:capacity})
        }
    }
}