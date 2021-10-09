var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var SpawnCreeps = require('SpawnCreeps');
var ExpectedNumCreeps = 6

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var NumCreeps = _.size(Memory.creeps)

    for(var name in Game.rooms) {
        var energyAvailable = Game.rooms[name].energyAvailable;
        var energyCapacity = Game.rooms[name].energyCapacityAvailable;
        console.log('Room "'+name+'" has '+ energyAvailable + '/' + energyCapacity + ' energy');
        
        for(const i in Game.spawns) {

            if(energyCapacity < 600){
                if((energyAvailable >= 200) && (NumCreeps < ExpectedNumCreeps)){
                    SpawnCreeps.smallCreeps(i);
                }
            }else if(energyCapacity < 1200){

                if((energyAvailable >= 600) && (NumCreeps < ExpectedNumCreeps)){
                    SpawnCreeps.mediumCreeps(i);
                }
            }
            
            if(Game.spawns[i].spawning) { 
                var spawningCreep = Game.creeps[Game.spawns[i].spawning.name];
                Game.spawns[i].room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    Game.spawns[i].pos.x + 1, 
                    Game.spawns[i].pos.y, 
                    {align: 'left', opacity: 0.8});
            }
            
        }
    }    
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

}

