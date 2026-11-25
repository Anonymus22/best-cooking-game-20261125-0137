// The shell of Noodle Night Market: it owns the canvas, the clock and the sound, and it routes
// the player's keys and clicks into the world. With ?shot=<scene> in the address it instead
// stages one fixed frame (see shots.js) — that is how the entry's screenshots are taken, and it
// sets window.__shotReady when the frame is on screen.

import { KitchenSounds } from './audio.js';
import { Input } from './input.js';
import { VIEW } from './config.js';
import { drawScene } from './render.js';
import { stageShot } from './shots.js';
import {
  SCREEN_OVER,
  SCREEN_PLAY,
  SCREEN_TITLE,
  createWorld,
  interact,
  resetShift,
  stationAtPoint,
  stationInReach,
  step,
  walkToStation,
} from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sounds = new KitchenSounds();
const input = new Input(canvas);
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 7) || 7;

/** Play the sound each world event names. */
function playEvents(events) {
  for (const event of events) {
    if (event === 'newOrder') sounds.click();
    else if (event === 'shiftEnd') sounds.cooked();
    else if (typeof sounds[event] === 'function') sounds[event]();
  }
}

function startShift(world) {
  resetShift(world, (Math.random() * 1e9) | 0);
  input.clearEdges();
}

const shotName = params.get('shot');
if (shotName !== null) {
  // Screenshot mode: stage the scene, draw it once the fonts are in, and hold the frame.
  const world = stageShot(shotName, seed);
  const draw = () => {
    drawScene(ctx, world);
    window.__shotReady = true;
  };
  if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(draw));
  else requestAnimationFrame(draw);
} else {
  const world = createWorld(seed);
  window.__world = world;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const events = [];

    if (input.takePress('Enter')) {
      sounds.unlock();
      if (world.screen !== SCREEN_PLAY) startShift(world);
    }
    if (input.takePress('KeyM')) {
      sounds.unlock();
      sounds.toggleMute();
    }

    const click = input.takeClick();
    if (click !== null) {
      sounds.unlock();
      if (world.screen !== SCREEN_PLAY) {
        startShift(world);
      } else {
        const station = stationAtPoint(click.x, click.y);
        if (station !== null) {
          if (stationInReach(world) === station) interact(world, events);
          else walkToStation(world, station);
        }
      }
    }

    if (world.screen === SCREEN_PLAY) {
      if (input.takePress('KeyE', 'Space')) {
        sounds.unlock();
        interact(world, events);
      }
      step(world, dt, input.direction(), events);
    } else {
      world.animT += dt;
    }

    playEvents(events);
    drawScene(ctx, world);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
