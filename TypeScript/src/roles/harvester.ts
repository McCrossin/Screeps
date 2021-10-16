export function roleHarvester(creep:Creep) {

    if(creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
        creep.memory.harvesting = true;
        creep.say('Storing');
    }

    if(!creep.memory.harvesting) {
        let energySource = creep.memory.energySource
        if(energySource != undefined){
            let dst = Game.getObjectById(energySource)
            if(dst != null){moveToSpecificEnergySource(creep,dst)}else{
                var sources = creep.room.find(FIND_SOURCES);
                moveToSpecificEnergySource(creep,sources[0])
            }
        }else{
            var sources = creep.room.find(FIND_SOURCES);
            moveToSpecificEnergySource(creep,sources[0])
        }
    }
    else {
        findFirstUpgradeTarget(creep);
    }
}

function moveToSpecificEnergySource(creep:Creep,source:Source){
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
}

function findFirstUpgradeTarget(creep: Creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
    }
}
