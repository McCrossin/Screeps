import { distanceTransform } from "scanners/distanceTransform"

/**
 * Plans extensions
 * Creates a Distrance Transforms 10 tiles around the first spawn
 * *Finds the closest available tile that is:
 *  * Two tiles away from the nearest wall
 *  * Two tiles away from the spawn
 *  * 
 * Places an extension construction site
 * @param room 
 * @param amount 
 */
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
                room.visual.text(e.closestwall ? e.closestwall.toString():"",e.x,e.y,{color:"purple"})
            }
        }
        
    }

}