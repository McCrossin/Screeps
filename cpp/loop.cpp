#include <Screeps/Context.hpp>
#include <Screeps/Creep.hpp>

#include <emscripten.h>
#include <emscripten/bind.h>

EMSCRIPTEN_KEEPALIVE
extern "C" void loop()
{
	Screeps::Context::update();

	std::printf("Game Time | %d\n", Screeps::Game.time());
	auto creeps = Screeps::Game.creeps();
	for (auto& creep : creeps)
		creep.second.say("screepsxx");
}

EMSCRIPTEN_BINDINGS(loop)
{
	emscripten::function("loop", &loop);
}