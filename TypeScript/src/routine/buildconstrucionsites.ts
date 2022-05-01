import { byId } from "selectors/byId";
import { routineResult } from "./routineResult";
import { setState, States } from "./states";

export const construcitonSitePriority:{[name:string]:number} = {
    "extension" : 5,
    "rampart" : 1,
    "road" : 1,
    "spawn" : 1,
    "link" : 1,
    "constructedWall" : 1,
    "keeperLair" : 1,
    "controller" : 1,
    "storage" : 1,
    "tower" : 100,
    "observer" : 1,
    "powerBank" : 1,
    "powerSpawn" : 1,
    "extractor" : 1,
    "lab" : 1,
    "terminal" : 1,
    "container" : 1,
    "nuker" : 1,
    "factory" : 1,
    "invaderCore" : 1,
    "portal" : 1,
}

export function buildConstructionSites(creep:Creep){
    // build a priority site
    let PConSites = Memory.OwnedRooms[creep.room.name].priorityConstructionSites
    if(PConSites != undefined && PConSites?.length > 0){
        let PConSite = byId(PConSites[0].id)
        if(PConSite == undefined)return
        let t = creep.build(PConSite)
        if( t== ERR_NOT_IN_RANGE) {
            creep.moveTo(PConSite, {visualizePathStyle: {stroke: '#ffffff'}})
        }
        if(t == ERR_NOT_ENOUGH_ENERGY) {
            setState(States.GET_ENERGY)(creep)
            return routineResult.SUCCESS
        }
        return routineResult.INPROGRESS
    }
    return routineResult.FAILURE
}