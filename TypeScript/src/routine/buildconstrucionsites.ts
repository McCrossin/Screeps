import { routineResult } from "./routineResult";
import { setState, States } from "./states";

export function buildConstructionSites(creep:Creep){
    let target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    if(target) {
        let transfer = creep.build(target)
        
        if( transfer== ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
        }
        if(transfer == ERR_NOT_ENOUGH_ENERGY) {
            setState(States.GET_ENERGY)(creep)
            return routineResult.SUCCESS
        }
        return routineResult.INPROGRESS

    }else{
        return routineResult.FAILURE
    }

}