import { OwnedRoomPragmas } from "pragmas/ownedRoom"
import { byId } from "selectors/byId"

export function drawSourceDebug() {
    for (let room in Memory.OwnedRooms) {
        for (let ORPragma in OwnedRoomPragmas) {
            let e = OwnedRoomPragmas[ORPragma]
            let source = byId(e.sourceId)
            if (source != undefined) {
                let color = e.disabled ? "red" : "white"
                let pos = new RoomPosition(source.pos.x, source.pos.y + 1, source.pos.roomName)
                Game.rooms[room].visual.text(
                    `Dst: ${e.distance}\r\nPriority: ${e.priority.toFixed(3)}`,
                    pos,
                    { color: color })
            }
        }
    }
}