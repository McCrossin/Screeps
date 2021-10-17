import { init } from "./initPragma";
import { OwnedRoomPragma } from "./OwnedRoom";

export function initDynamicPragmas(OwnedRoom:string){
    init(
        ...Memory.rooms[OwnedRoom].sources.map(source => new OwnedRoomPragma(8.5,OwnedRoom,source.id))
    )
}