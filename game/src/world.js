// The simulation of Noodle Night Market: the chef, the stations, the burners, the order board
// and the clock. Pure state and rules — no drawing, no sound. Actions report what happened as
// event names ('chop', 'serve', …) so the shell can play the matching sound.

import { CHEF, FLOOR, REACH, RAMP, STATIONS, TIMING } from './config.js';
import { INGREDIENTS, MAX_TIP, RECIPES, RECIPE_ORDER, dishForContents } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

/** Which ingredient each crate hands out. */
const CRATE_INGREDIENT = { noodleCrate: 'noodles', eggBasket: 'egg', greensCrate: 'greens', chiliCrate: 'chili' };

/** Deterministic random source (mulberry32), so staged scenes and tests replay exactly. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh world on the title screen; `resetShift` deals a new night. */
export function createWorld(seed = 1) {
  const world = {
    screen: SCREEN_TITLE,
    rng: makeRng(seed),
    animT: 0,
    time: 0,
    timeLeft: TIMING.shiftSeconds,
    coins: 0,
    served: 0,
    missed: 0,
    hearts: TIMING.hearts,
    best: 0,
    chef: { x: CHEF.startX, y: CHEF.startY, facing: { x: 0, y: -1 }, walkPhase: 0, moving: false },
    carry: null,
    board: null,
    burners: [null, null],
    pass: null,
    orders: [],
    nextSpawnIn: TIMING.firstOrderAt,
    nextOrderId: 1,
    walkTarget: null,
    floats: [],
    hint: null,
  };
  return world;
}

/** Start a fresh shift: empty counters, full hearts, the first order about to land. */
export function resetShift(world, seed) {
  const rng = makeRng(seed);
  Object.assign(world, {
    screen: SCREEN_PLAY,
    rng,
    time: 0,
    timeLeft: TIMING.shiftSeconds,
    coins: 0,
    served: 0,
    missed: 0,
    hearts: TIMING.hearts,
    carry: null,
    board: null,
    burners: [null, null],
    pass: null,
    orders: [],
    nextSpawnIn: TIMING.firstOrderAt,
    nextOrderId: 1,
    walkTarget: null,
    floats: [],
    hint: null,
  });
  world.chef.x = CHEF.startX;
  world.chef.y = CHEF.startY;
  world.chef.facing = { x: 0, y: -1 };
}

/** The ramp row in force `elapsed` seconds into the shift. */
export function rampFor(elapsed) {
  for (const row of RAMP) if (elapsed < row.until) return row;
  return RAMP[RAMP.length - 1];
}

/** Stars a finished shift earns for its coin total: the results screen's verdict. */
export function starsFor(coins) {
  if (coins >= 300) return 3;
  if (coins >= 190) return 2;
  if (coins >= 100) return 1;
  return 0;
}

/** Distance from a point to a rectangle (0 inside it). */
function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

/** The station key the chef can work right now, or null when none is in reach. */
export function stationInReach(world) {
  const { x, y } = world.chef;
  let best = null;
  let bestDistance = REACH;
  for (const [key, rect] of Object.entries(STATIONS)) {
    const d = distanceToRect(x, y, rect);
    if (d <= bestDistance) {
      bestDistance = d;
      best = key;
    }
  }
  return best;
}

/** The station whose counter contains a point (for mouse clicks), or null. */
export function stationAtPoint(x, y) {
  for (const [key, rect] of Object.entries(STATIONS)) {
    if (x >= rect.x - 10 && x <= rect.x + rect.width + 10 && y >= rect.y - 10 && y <= rect.y + rect.height + 10) return key;
  }
  return null;
}

function setHint(world, text) {
  world.hint = { text, until: world.animT + 2.2 };
}

function addFloat(world, x, y, text, color) {
  world.floats.push({ x, y, text, color, t: 0, life: 1.4 });
}

/** A new order ticket lands on the board, from the recipe pool the ramp has unlocked. */
function spawnOrder(world) {
  const ramp = rampFor(world.time);
  const pool = RECIPE_ORDER.slice(0, ramp.recipePool);
  const dishId = pool[Math.floor(world.rng() * pool.length)];
  const patience = ramp.patience * (0.9 + world.rng() * 0.2);
  world.orders.push({ id: world.nextOrderId, dishId, patience, patienceMax: patience });
  world.nextOrderId += 1;
}

/** Move the chef by a direction for `dt`, keeping him on the floor and out of the counters. */
function moveChef(world, dt, dir) {
  const chef = world.chef;
  let { x, y } = chef;
  if (dir.x !== 0 || dir.y !== 0) {
    const len = Math.hypot(dir.x, dir.y);
    x += (dir.x / len) * CHEF.speed * dt;
    y += (dir.y / len) * CHEF.speed * dt;
    chef.facing = { x: dir.x / len, y: dir.y / len };
    chef.moving = true;
    chef.walkPhase += dt * 11;
  } else {
    chef.moving = false;
  }
  x = Math.min(FLOOR.x + FLOOR.width - CHEF.radius, Math.max(FLOOR.x + CHEF.radius, x));
  y = Math.min(FLOOR.y + FLOOR.height - CHEF.radius, Math.max(FLOOR.y + CHEF.radius, y));
  // Counters are solid: slide out of any station rectangle the step entered.
  for (const rect of Object.values(STATIONS)) {
    const insideX = x > rect.x - CHEF.radius * 0.6 && x < rect.x + rect.width + CHEF.radius * 0.6;
    const insideY = y > rect.y - CHEF.radius * 0.6 && y < rect.y + rect.height + CHEF.radius * 0.6;
    if (insideX && insideY) {
      const pushLeft = x - (rect.x - CHEF.radius * 0.6);
      const pushRight = rect.x + rect.width + CHEF.radius * 0.6 - x;
      const pushUp = y - (rect.y - CHEF.radius * 0.6);
      const pushDown = rect.y + rect.height + CHEF.radius * 0.6 - y;
      const min = Math.min(pushLeft, pushRight, pushUp, pushDown);
      if (min === pushLeft) x = rect.x - CHEF.radius * 0.6;
      else if (min === pushRight) x = rect.x + rect.width + CHEF.radius * 0.6;
      else if (min === pushUp) y = rect.y - CHEF.radius * 0.6;
      else y = rect.y + rect.height + CHEF.radius * 0.6;
    }
  }
  chef.x = x;
  chef.y = y;
}

/**
 * Advance the shift by `dt` seconds. `dir` is the player's movement; a queued walk target (from
 * a mouse click) drives instead until it arrives. Sound-worthy moments are pushed to `events`.
 */
export function step(world, dt, dir, events) {
  world.animT += dt;
  if (world.screen !== SCREEN_PLAY) return;
  world.time += dt;
  world.timeLeft = Math.max(0, TIMING.shiftSeconds - world.time);

  // Walking: a click target overrides the keys until it is reached or the player steers.
  let move = dir;
  if (world.walkTarget !== null) {
    if (dir.x !== 0 || dir.y !== 0) {
      world.walkTarget = null;
    } else {
      const target = world.walkTarget;
      const dx = target.x - world.chef.x;
      const dy = target.y - world.chef.y;
      if (Math.hypot(dx, dy) < 8) {
        const station = target.station;
        world.walkTarget = null;
        if (station !== null && stationInReach(world) === station) interact(world, events);
        move = { x: 0, y: 0 };
      } else {
        move = { x: Math.sign(dx), y: Math.sign(dy) };
        if (Math.abs(dx) < 6) move.x = 0;
        if (Math.abs(dy) < 6) move.y = 0;
      }
    }
  }
  moveChef(world, dt, move);

  // Burners: cooking bowls ripen, then burn.
  for (const burner of world.burners) {
    if (burner === null) continue;
    burner.t += dt;
    if (burner.state === 'cooking' && burner.t >= TIMING.cookSeconds) {
      burner.state = 'cooked';
      events.push('cooked');
    } else if (burner.state === 'cooked' && burner.t >= TIMING.burnSeconds) {
      burner.state = 'burnt';
      events.push('refuse');
    }
  }

  // Orders: patience drains; an empty bar costs a heart.
  const ramp = rampFor(world.time);
  for (let i = world.orders.length - 1; i >= 0; i -= 1) {
    const order = world.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      world.orders.splice(i, 1);
      world.missed += 1;
      world.hearts -= 1;
      events.push('expire');
      addFloat(world, 640, 150, 'Order walked away!', '#e2483d');
    }
  }

  // New tickets while the board has room.
  world.nextSpawnIn -= dt;
  if (world.nextSpawnIn <= 0) {
    if (world.orders.length < ramp.maxOrders) {
      spawnOrder(world);
      events.push('newOrder');
    }
    world.nextSpawnIn = ramp.spawnMin + world.rng() * (ramp.spawnMax - ramp.spawnMin);
  }

  // Floating score text rises and fades.
  for (let i = world.floats.length - 1; i >= 0; i -= 1) {
    const f = world.floats[i];
    f.t += dt;
    f.y -= 34 * dt;
    if (f.t >= f.life) world.floats.splice(i, 1);
  }

  if (world.hearts <= 0 || world.timeLeft <= 0) {
    world.screen = SCREEN_OVER;
    world.best = Math.max(world.best, world.coins);
    events.push('shiftEnd');
  }
}

/** Try to add an ingredient to the bowl in hand; shared by the crates, the pot and the board. */
function addToBowl(world, id, events) {
  const bowl = world.carry;
  if (bowl.contents.includes(id)) {
    setHint(world, `The bowl already has ${INGREDIENTS[id].name.toLowerCase()}.`);
    events.push('refuse');
    return false;
  }
  if (bowl.contents.length >= 4) {
    setHint(world, 'The bowl is full.');
    events.push('refuse');
    return false;
  }
  bowl.contents.push(id);
  events.push('addToBowl');
  return true;
}

/** Resolve a cooked bowl's dish and take it in hand from a burner or the pass. */
function takeCookedBowl(world, slot) {
  const dishId = slot.state === 'cooked' ? dishForContents(slot.contents) : null;
  world.carry = {
    kind: 'bowl',
    contents: [...slot.contents],
    state: slot.state === 'burnt' ? 'burnt' : dishId === null ? 'mush' : 'cooked',
    dishId,
  };
}

/**
 * Work the station in reach — the game's one big verb. What E does depends on the station and
 * on what the hands hold; every refusal explains itself in a hint and a buzz.
 */
export function interact(world, events) {
  const station = stationInReach(world);
  if (station === null) return;
  const carry = world.carry;

  if (station in CRATE_INGREDIENT) {
    const id = CRATE_INGREDIENT[station];
    if (carry === null) {
      world.carry = { kind: 'ingredient', id, chopped: false };
      events.push('pickup');
    } else if (carry.kind === 'bowl' && carry.state === 'raw') {
      if (INGREDIENTS[id].needsChop) {
        setHint(world, `${INGREDIENTS[id].name} must be chopped first — take it to the board.`);
        events.push('refuse');
      } else {
        addToBowl(world, id, events);
      }
    } else {
      setHint(world, 'Hands are full.');
      events.push('refuse');
    }
    return;
  }

  switch (station) {
    case 'brothPot': {
      if (carry !== null && carry.kind === 'bowl' && carry.state === 'raw') addToBowl(world, 'broth', events);
      else if (carry === null) {
        setHint(world, 'Bring a bowl to ladle broth into.');
        events.push('refuse');
      } else {
        setHint(world, 'Broth goes in a bowl.');
        events.push('refuse');
      }
      break;
    }
    case 'bowlStack': {
      if (carry === null) {
        world.carry = { kind: 'bowl', contents: [], state: 'raw', dishId: null };
        events.push('pickup');
      } else if (carry.kind === 'ingredient' && (!INGREDIENTS[carry.id].needsChop || carry.chopped)) {
        // Holding an ingredient that is ready for a bowl: take the bowl and drop it straight in.
        world.carry = { kind: 'bowl', contents: [carry.id], state: 'raw', dishId: null };
        events.push('addToBowl');
      } else if (carry.kind === 'ingredient') {
        setHint(world, `${INGREDIENTS[carry.id].name} must be chopped before it can go in a bowl.`);
        events.push('refuse');
      } else {
        setHint(world, 'Hands are full.');
        events.push('refuse');
      }
      break;
    }
    case 'choppingBoard': {
      const boardReady = world.board !== null && world.board.chops >= TIMING.chopsNeeded;
      if (carry !== null && carry.kind === 'ingredient' && INGREDIENTS[carry.id].needsChop && !carry.chopped && world.board === null) {
        world.board = { id: carry.id, chops: 0 };
        world.carry = null;
        events.push('place');
      } else if (carry !== null && carry.kind === 'bowl' && carry.state === 'raw' && boardReady) {
        if (addToBowl(world, world.board.id, events)) world.board = null;
      } else if (carry === null && world.board !== null && !boardReady) {
        world.board.chops += 1;
        events.push('chop');
      } else if (carry === null && boardReady) {
        world.carry = { kind: 'ingredient', id: world.board.id, chopped: true };
        world.board = null;
        events.push('pickup');
      } else if (carry !== null && carry.kind === 'ingredient' && !INGREDIENTS[carry.id].needsChop) {
        setHint(world, `${INGREDIENTS[carry.id].name} doesn't need chopping.`);
        events.push('refuse');
      } else if (world.board !== null) {
        setHint(world, 'Finish chopping first.');
        events.push('refuse');
      } else {
        setHint(world, 'Bring greens or chili here to chop.');
        events.push('refuse');
      }
      break;
    }
    case 'stove': {
      if (carry !== null && carry.kind === 'bowl' && carry.state === 'raw') {
        const free = world.burners.findIndex((b) => b === null);
        if (free === -1) {
          setHint(world, 'Both burners are busy.');
          events.push('refuse');
        } else if (carry.contents.length === 0) {
          setHint(world, 'An empty bowl has nothing to cook.');
          events.push('refuse');
        } else {
          world.burners[free] = { contents: [...carry.contents], t: 0, state: 'cooking' };
          world.carry = null;
          events.push('stoveOn');
        }
      } else if (carry === null) {
        const ready = world.burners.findIndex((b) => b !== null && b.state !== 'cooking');
        if (ready !== -1) {
          takeCookedBowl(world, world.burners[ready]);
          world.burners[ready] = null;
          events.push('pickup');
        } else if (world.burners.some((b) => b !== null)) {
          setHint(world, 'Still cooking — watch the ring.');
          events.push('refuse');
        } else {
          setHint(world, 'Put a filled bowl on a burner.');
          events.push('refuse');
        }
      } else {
        setHint(world, 'Hands are full.');
        events.push('refuse');
      }
      break;
    }
    case 'passCounter': {
      if (carry !== null && carry.kind === 'bowl' && (carry.state === 'cooked' || carry.state === 'mush') && world.pass === null) {
        world.pass = { contents: [...carry.contents], state: carry.state, dishId: carry.dishId };
        world.carry = null;
        events.push('place');
      } else if (carry === null && world.pass !== null) {
        world.carry = { kind: 'bowl', contents: [...world.pass.contents], state: world.pass.state, dishId: world.pass.dishId };
        world.pass = null;
        events.push('pickup');
      } else if (world.pass !== null) {
        setHint(world, 'The pass already holds a dish.');
        events.push('refuse');
      } else {
        setHint(world, 'Cooked dishes wait here, ready to serve.');
        events.push('refuse');
      }
      break;
    }
    case 'serveWindow': {
      // Serve from the hands first, else from the pass — a plated dish is ready either way.
      let source = null;
      if (carry !== null && carry.kind === 'bowl' && carry.state === 'cooked') source = 'hands';
      else if (world.pass !== null && world.pass.state === 'cooked') source = 'pass';
      if (source === null) {
        if (carry !== null && carry.kind === 'bowl' && (carry.state === 'burnt' || carry.state === 'mush')) {
          setHint(world, 'Nobody ordered that — trash it.');
        } else {
          setHint(world, 'Bring a cooked dish that matches a ticket.');
        }
        events.push('refuse');
        break;
      }
      const dishId = source === 'hands' ? carry.dishId : world.pass.dishId;
      const index = world.orders.findIndex((o) => o.dishId === dishId);
      if (index === -1) {
        setHint(world, `No ticket wants ${RECIPES[dishId].name} right now.`);
        events.push('refuse');
        break;
      }
      const order = world.orders[index];
      const tip = Math.round(MAX_TIP * (order.patience / order.patienceMax));
      const earned = RECIPES[dishId].price + tip;
      world.coins += earned;
      world.served += 1;
      world.orders.splice(index, 1);
      if (source === 'hands') world.carry = null;
      else world.pass = null;
      addFloat(world, 1145, 300, `+${earned}`, '#ffd75e');
      events.push('serve');
      break;
    }
    case 'trashBin': {
      if (carry !== null) {
        world.carry = null;
        events.push('trash');
      } else {
        setHint(world, 'Nothing in hand to throw away.');
        events.push('refuse');
      }
      break;
    }
    default:
      break;
  }
}

/** Send the chef walking toward a station (mouse play); arrival works the station once. */
export function walkToStation(world, stationKey) {
  const rect = STATIONS[stationKey];
  const chef = world.chef;
  // Aim at the floor point just off the counter's nearest edge, on the chef's own side of it.
  const cx = Math.min(rect.x + rect.width, Math.max(rect.x, chef.x));
  const cy = Math.min(rect.y + rect.height, Math.max(rect.y, chef.y));
  let dx = chef.x - cx;
  let dy = chef.y - cy;
  if (dx === 0 && dy === 0) dy = 1;
  const len = Math.hypot(dx, dy);
  world.walkTarget = { x: cx + (dx / len) * 46, y: cy + (dy / len) * 46, station: stationKey };
}
