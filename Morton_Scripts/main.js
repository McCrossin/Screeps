var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
const SpawnCreeps = require('./SpawnCreeps');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for(var name in Game.rooms) {
        var energyAvailable = Game.rooms[name].energyAvailable'
        console.log('Room "'+name+'" has '+ energyAvailable +' energy');
        
        for(const i in Game.spawns) {
            if(energyAvailable >= 200){
                SpawnCreeps.run(i);
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

