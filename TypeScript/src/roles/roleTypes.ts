export enum RoleTypes {
    T1 = 'T1',
    T1_Combat = 'T1_Combat'
}

//TOASK - The energy < 200 what is it for?
export const roles = {
    [RoleTypes.T1]: (energy:number) => {
        if (energy < 200){
            return [WORK,CARRY,MOVE]
        }
        return [];
    },
    [RoleTypes.T1_Combat]: (energy:number) => {
        if (energy < 200){
            return [ATTACK,TOUGH,TOUGH,MOVE,MOVE]
        }
        return [];
    }
}