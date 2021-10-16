import { routineResult } from "./routineResult";
export enum States {
    GET_ENERGY = 'GET_ENERGY',
    GET_ENERGY_SOURCE = 'GET_ENERGY_SOURCE',    
    WORKING = 'WORKING',
    WITHDRAW = 'WITHDRAW',
    DEPOSIT = 'DEPOSIT',
    DONE = 'DONE',
}

declare global {
    interface CreepMemory {
        state?: States
    }
}

/**
 * Returns SUCCESS if state matches, FAILURE otherwise
 */
 export const stateIs = (state: States) => {
    return (creep: Creep) => {
        if (creep.memory.state === state) return routineResult.SUCCESS;
        return routineResult.FAILURE;
    }
}

/**
 * Returns SUCCESS if state is empty, FAILURE otherwise
 */
export const stateIsEmpty = () => {
    return (creep: Creep) => {
        if (creep.memory.state === undefined) return routineResult.SUCCESS;
        return routineResult.FAILURE;
    }
}

/**
 * Returns SUCCESS and sets state in blackboard
 */
export const setState = (state: States) => {
    return (creep: Creep) => {
        creep.memory.state = state;
        return routineResult.SUCCESS;
    }
}