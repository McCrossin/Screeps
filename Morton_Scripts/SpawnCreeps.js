var SpawnCreeps = {

    /** @param {SpawnName} SpawnName 
        {energyCapacity} Max energy**/
    smallCreeps: function(SpawnName) {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        //console.log('Harvesters: ' + harvesters.length);

        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        //console.log('Upgraders: ' + upgraders.length);

        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        //console.log('Builders: ' + builders.length);

        if(harvesters.length < 2) {
            var newHarvesterName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newHarvesterName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newHarvesterName, 
                {memory: {role: 'harvester'}});        
        }else if(upgraders.length < 3){
            var newUpgraderName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newUpgraderName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newUpgraderName,
                {memory: {role: 'upgrader'}})
        }else if(builders.length < 1){
            var newBuilderName = 'Builder' + Game.time;
            console.log('Spawning new buidler: ' + newBuilderName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newBuilderName,
                {memory: {role: 'builder'}})
        }
        
        

	},

    mediumCreeps: function(SpawnName) {

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        //console.log('Harvesters: ' + harvesters.length);

        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        //console.log('Upgraders: ' + upgraders.length);

        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        //console.log('Builders: ' + builders.length);

        if(harvesters.length < 2) {
            var newHarvesterName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newHarvesterName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newHarvesterName, 
                {memory: {role: 'harvester'}});        
        }else if(upgraders.length < 3){
            var newUpgraderName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newUpgraderName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newUpgraderName,
                {memory: {role: 'upgrader'}})
        }else if(builders.length < 1){
            var newBuilderName = 'Builder' + Game.time;
            console.log('Spawning new buidler: ' + newBuilderName);
            Game.spawns[SpawnName].spawnCreep([WORK,CARRY,MOVE], newBuilderName,
                {memory: {role: 'builder'}})
        }
        
        if(Game.spawns[SpawnName].spawning) { 
            var spawningCreep = Game.creeps[Game.spawns[SpawnName].spawning.name];
            Game.spawns[SpawnName].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[SpawnName].pos.x + 1, 
                Game.spawns[SpawnName].pos.y, 
                {align: 'left', opacity: 0.8});
        }

	}
};

module.exports = SpawnCreeps;