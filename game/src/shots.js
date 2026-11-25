// The staged scenes behind ?shot=cover|assembly|rush|results — the frames the screenshots are
// taken from. Each one deals a real world and arranges it by hand (orders on the board, a bowl
// mid-assembly in the chef's hands, a dish cooking, a plated dish on the pass) so the frame is
// exactly what a busy moment of the real game looks like, and the same seed always stages the
// same frame.

import { SCREEN_OVER, SCREEN_PLAY, createWorld } from './world.js';

/** Cover: mid-service, everything the game is about in one frame. */
function stageCover(world) {
  world.screen = SCREEN_PLAY;
  world.time = 38;
  world.timeLeft = 112;
  world.coins = 86;
  world.served = 3;
  world.orders = [
    { id: 1, dishId: 'classicSoup', patience: 41, patienceMax: 62 },
    { id: 2, dishId: 'dragonNoodles', patience: 30, patienceMax: 54 },
    { id: 3, dishId: 'gardenBroth', patience: 52, patienceMax: 62 },
  ];
  // A bowl mid-assembly in the chef's hands: noodles and broth in, chopped greens still to come.
  world.carry = { kind: 'bowl', contents: ['noodles', 'broth'], state: 'raw', dishId: null };
  world.chef.x = 330;
  world.chef.y = 452;
  world.chef.facing = { x: -1, y: 0.2 };
  // Greens chopped and waiting on the board; a Firecracker Soup is on the stove.
  world.board = { id: 'greens', chops: 3 };
  world.burners[0] = { contents: ['noodles', 'broth', 'chili', 'egg'], t: 2.3, state: 'cooking' };
  // A finished Classic Noodle Soup plated on the pass, ready to serve.
  world.pass = { contents: ['noodles', 'broth', 'greens'], state: 'cooked', dishId: 'classicSoup' };
  world.animT = 2.4;
}

/** Assembly: the chop mid-swing and a bowl already on the heat. */
function stageAssembly(world) {
  world.screen = SCREEN_PLAY;
  world.time = 21;
  world.timeLeft = 129;
  world.coins = 30;
  world.served = 1;
  world.orders = [
    { id: 1, dishId: 'dragonNoodles', patience: 47, patienceMax: 62 },
    { id: 2, dishId: 'classicSoup', patience: 55, patienceMax: 62 },
  ];
  // The chef is at the board, two chops into the greens, hands free.
  world.chef.x = 345;
  world.chef.y = 578;
  world.chef.facing = { x: 0, y: 1 };
  world.board = { id: 'greens', chops: 2 };
  world.burners[0] = { contents: ['noodles', 'egg'], t: 1.6, state: 'cooking' };
  world.burners[1] = { contents: ['broth', 'greens', 'egg'], t: 5.2, state: 'cooked' };
  world.animT = 1.1;
}

/** Rush: four tickets, one about to walk, a serve on its way to the window. */
function stageRush(world) {
  world.screen = SCREEN_PLAY;
  world.time = 118;
  world.timeLeft = 32;
  world.coins = 214;
  world.served = 7;
  world.missed = 1;
  world.hearts = 2;
  world.orders = [
    { id: 1, dishId: 'firecrackerSoup', patience: 8, patienceMax: 46 },
    { id: 2, dishId: 'classicSoup', patience: 25, patienceMax: 46 },
    { id: 3, dishId: 'dragonNoodles', patience: 38, patienceMax: 54 },
    { id: 4, dishId: 'gardenBroth', patience: 44, patienceMax: 54 },
  ];
  // The chef hurries a cooked Dragon Fire Noodles to the window.
  world.carry = { kind: 'bowl', contents: ['noodles', 'chili', 'egg'], state: 'cooked', dishId: 'dragonNoodles' };
  world.chef.x = 950;
  world.chef.y = 400;
  world.chef.facing = { x: 1, y: -0.2 };
  world.chef.walkPhase = 2.2;
  // A Garden Broth Bowl waits on the pass; both burners are working.
  world.pass = { contents: ['broth', 'greens', 'egg'], state: 'cooked', dishId: 'gardenBroth' };
  world.burners[0] = { contents: ['noodles', 'broth', 'greens'], t: 6.1, state: 'cooked' };
  world.burners[1] = { contents: ['noodles', 'broth', 'chili', 'egg'], t: 3.1, state: 'cooking' };
  world.floats = [{ x: 1145, y: 292, text: '+52', color: '#ffd75e', t: 0.3, life: 1.4 }];
  world.animT = 3.7;
}

/** Results: the shift is over and the night is counted. */
function stageResults(world) {
  world.screen = SCREEN_OVER;
  world.time = 150;
  world.timeLeft = 0;
  world.coins = 286;
  world.served = 11;
  world.missed = 2;
  world.hearts = 1;
  world.best = 286;
  world.pass = { contents: ['noodles', 'broth', 'chili', 'egg'], state: 'cooked', dishId: 'firecrackerSoup' };
  world.chef.x = 640;
  world.chef.y = 470;
  world.animT = 0.8;
}

const SCENES = { cover: stageCover, assembly: stageAssembly, rush: stageRush, results: stageResults };

/** Stage the named scene on a fresh world and return it, ready to draw. */
export function stageShot(name, seed = 7) {
  const world = createWorld(seed);
  (SCENES[name] ?? stageCover)(world);
  return world;
}
