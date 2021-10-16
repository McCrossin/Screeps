export enum RoleTypes {
    T1 = 'T1'
}

export const roles = {
    [RoleTypes.T1]: (energy:number) => {
        if (energy < 200){
            return [WORK,CARRY,MOVE]
        }
        return [];
    }
}