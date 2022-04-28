import { calcDstBetweenPoints, distanceTransform } from "scanners/distanceTransform"

/**
 * Plans extensions
 * Creates a Distrance Transforms 10 tiles around the first spawn
 * *Finds the closest available tile that is:
 *  * Two tiles away from the nearest wall
 *  * Two tiles away from the spawn
 *  * Use a checker pattern ...
 * Places an extension construction site
 * @param room 
 * @param amount 
 */

export interface plannedExtensions extends distanceTransform {
    closestspawn?:number
}

export function planExtensions(room:Room){
    // For now this will plan based on out spawn
    let spawns = room.find(FIND_MY_SPAWNS)
    // checker pattern ... (x + y) % 2 === 0
    if (spawns.length > 0) {
        let s = spawns[0].pos
        // Look at area 10 tiles around the spawn
        // returns an array
        let dstTrans = distanceTransform(room,
            s.y-5,s.x-5,s.y+5,s.x+5)
        // Loop over the results from the distance transform
        let r:Array<plannedExtensions> = []
        for (const j in dstTrans) {
            if (Object.prototype.hasOwnProperty.call(dstTrans, j)) {
                const e = dstTrans[j] as plannedExtensions;
                // calc the distance to the nearest spawn
                e.closestspawn = calcDstBetweenPoints(s.x,s.y,e.x,e.y)
                if (
                    (e.x+e.y) % 2 === 0 && // Checker pattern
                    (e.closestwall ? e.closestwall:0) >2 && // greater than two from walls
                    e.closestspawn >2) // greater then 2 from the target spawn
                {
                    r.push(e)
                }
                
            }
        }
        return r
    }
    return undefined
}