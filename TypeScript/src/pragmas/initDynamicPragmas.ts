import { init } from "./initPragma";
import { OwnedRoomPragma } from "./OwnedRoom";


/**
 * Inits dynamic pragmas
 * Creates pragmas for each energy soruce in the room with a low priority
 * @param OwnedRoom Room to add the Dynamic Pragmas too
 */
export function initDynamicPragmas(OwnedRoom:string){
    init(
        ...Memory.OwnedRooms[OwnedRoom].sources.map(source => new OwnedRoomPragma(8.5,OwnedRoom,source.id))
    )
}
