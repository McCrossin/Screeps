import { RoleTypes } from "./roleTypes";

export function spawnRole(
    OwnedRoom:string,
    pragma:string,
    roleType: RoleTypes,
    body: BodyPartConstant[]
) {
    let spawn = (Game.rooms[OwnedRoom].find(FIND_MY_SPAWNS))[0]
    spawn.spawnCreep(
        body,
        `${roleType}-${OwnedRoom}-${Game.time % 10000}-${spawn.id.slice(23)}`,
        {
            memory:{
                Pragma: pragma,
                role: roleType,
                OwnedRoom:OwnedRoom
            }
        }
    )
}