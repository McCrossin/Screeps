
/**
 * ById find a game object by a game object id
 * @template T the type of game object Source etc
 * @param id ID of the game object
 * @returns the gameobject or undefined
 */
export function byId<T extends _HasId>(id: Id<T>|undefined){
    return id ? Game.getObjectById(id) ?? undefined : undefined
}

byId()