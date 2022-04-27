export function drawSpawnStrucUI(SpawnStructure:StructureSpawn, 
    energyAvailable:number, energyCapacity:number) {

    if(SpawnStructure.spawning) {

        var spawningCreep = Game.creeps[SpawnStructure.spawning.name];
        SpawnStructure.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            SpawnStructure.pos.x + 1, 
            SpawnStructure.pos.y, 
            {align: 'left', opacity: 0.8});

    }

    SpawnStructure.room.visual.text(
        '⚡' + energyAvailable + '/' + energyCapacity + '⚡',
        SpawnStructure.pos.x,
        SpawnStructure.pos.y + 1.5,
        {align: 'center', opacity: 0.8});
}