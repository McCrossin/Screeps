export enum RoleTypes {
    T1 = 'T1',
    T1_Combat = 'T1_Combat',
    T2_Worker = 'T2_Worker',
    T2_Carry = 'T2_Carry'
}

enum PartCost {
    move = 50,
    work = 100,
    carry = 50,
    ATTACK = 80,
    ranged_attack = 150,
    heal = 250,
    claim = 600,
    tough = 10
}
//TOASK - The energy < 200 what is it for?
export const roles = {
    [RoleTypes.T1]: (energy:number) => {
        if (energy < 200){
            return []
        }
        else {
            // Try to maintain WORK/CARRY/MOVE ratio
            const part = [WORK, MOVE, CARRY]
            const partCost = part.reduce((sum, p) => sum + BODYPART_COST[p], 0)
            const parts = Math.min(Math.floor(50 / part.length), Math.floor(energy / partCost))

            return Array(parts).fill(part).flat()
        }
    },
    [RoleTypes.T1_Combat]: (energy:number) => {
        if (energy < 200){
            return [ATTACK,TOUGH,TOUGH,MOVE,MOVE]
        }
        return [];
    },
    [RoleTypes.T2_Worker]: (energy:number) => {
        if (energy < 550){
            return []
        } else {
            // Maintain 4-1 WORK-MOVE ratio
            let workParts = Math.min(40, Math.floor((8/9 * energy) / 100))
            let moveParts = Math.min(10, Math.floor((1/9 * energy) / 50))
            return ([] as BodyPartConstant[]).concat(
                Array(workParts).fill(WORK),
                Array(moveParts).fill(MOVE)
            )            
        }
        
    },
    [RoleTypes.T2_Carry]: (energy:number,maxSegments:number=25,roads:boolean=false) => {
        if (energy <= 300){
            return [CARRY,MOVE]
        }else if(!roads){
            const parts = Math.min(25, maxSegments, Math.floor(energy / 2) / 100)
            return Array(parts).fill([CARRY, MOVE]).flat();
        } else {
            const parts = Math.min(16, maxSegments, Math.floor(energy / 2) / 150)
            return Array(parts).fill([CARRY,CARRY, MOVE]).flat();
        }
    }    
}