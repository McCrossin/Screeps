import { distanceTransform } from "scanners/distanceTransform"

export function planExtensions(room:Room,amount:number){
    // For now this will plan based on out spawn
    let spawns = room.find(FIND_MY_SPAWNS)
    // checker pattern ... (x + y) % 2 === 0
    if (spawns.length > 0) {
        let s = spawns[0].pos
        let r = distanceTransform(room,
            s.y-5,s.x-5,s.y+5,s.x+5)
        for (const j in r) {
            if (Object.prototype.hasOwnProperty.call(r, j)) {
                const e = r[j];
                room.visual.text(e.dist.toString(),e.x,e.y)
            }
        }
    }

}