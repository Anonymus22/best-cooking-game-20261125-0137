// Everything the player sees: the night-market kitchen, the order board with its tickets and
// the shift clock, the counters and their contents, the chef, and the title and results
// screens laid over the room. Drawing only — every rule lives in world.js.

import { BOARD, BURNERS, COLORS, FLOOR, STATIONS, TIMING, VIEW } from './config.js';
import { INGREDIENTS, RECIPES } from './recipes.js';
import { drawBowl, drawChef, drawIngredientIcon, drawSteam } from './food-art.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, starsFor, stationInReach } from './world.js';

const TICKET = { x: 40, y: 27, width: 212, height: 92, gap: 12 };

/** Rounded rectangle path. */
function roundRect(ctx, x, y, width, height, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** A heart shape (a life), filled or hollow. */
function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.85);
  ctx.bezierCurveTo(-size * 1.15, -size * 0.15, -size * 0.55, -size * 1.05, 0, -size * 0.35);
  ctx.bezierCurveTo(size * 0.55, -size * 1.05, size * 1.15, -size * 0.15, 0, size * 0.85);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#e2483d';
    ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(247,234,210,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/** The room itself: indigo walls, the board strip, a tiled floor and two paper lanterns. */
function drawRoom(ctx, t) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Floor tiles.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(FLOOR.x, FLOOR.y, FLOOR.width, FLOOR.height);
  const tile = 60;
  ctx.fillStyle = 'rgba(255,235,200,0.045)';
  for (let row = 0; row < FLOOR.height / tile; row += 1) {
    for (let col = 0; col < FLOOR.width / tile; col += 1) {
      if ((row + col) % 2 === 0) ctx.fillRect(FLOOR.x + col * tile, FLOOR.y + row * tile, tile, tile);
    }
  }
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 6;
  ctx.strokeRect(FLOOR.x, FLOOR.y, FLOOR.width, FLOOR.height);
  // A woven runner mat in the middle of the floor, where the cook spends the night.
  ctx.fillStyle = '#5d3a2a';
  roundRect(ctx, 445, 372, 390, 150, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,168,60,0.4)';
  ctx.lineWidth = 2.4;
  roundRect(ctx, 457, 384, 366, 126, 8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(224,168,60,0.16)';
  ctx.lineWidth = 7;
  for (let mx = 485; mx < 810; mx += 36) {
    ctx.beginPath();
    ctx.moveTo(mx, 392);
    ctx.lineTo(mx, 502);
    ctx.stroke();
  }
  // Lanterns: warm glow pools hanging over the kitchen.
  for (const lx of [300, 980]) {
    const glow = ctx.createRadialGradient(lx, 168, 8, lx, 168, 120);
    glow.addColorStop(0, 'rgba(255,166,47,0.34)');
    glow.addColorStop(1, 'rgba(255,166,47,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(lx - 120, 48, 240, 240);
    ctx.strokeStyle = '#0f0d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 140);
    ctx.lineTo(lx, 152 + Math.sin(t * 1.3 + lx) * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#e2483d';
    roundRect(ctx, lx - 13, 152 + Math.sin(t * 1.3 + lx) * 1.5, 26, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#e0a83c';
    ctx.fillRect(lx - 13, 160 + Math.sin(t * 1.3 + lx) * 1.5, 26, 3);
    ctx.fillRect(lx - 13, 174 + Math.sin(t * 1.3 + lx) * 1.5, 26, 3);
  }
}

/** One order ticket: the dish as a picture, its name, its recipe as icons, its patience bar. */
function drawTicket(ctx, order, index, t) {
  const x = TICKET.x + index * (TICKET.width + TICKET.gap);
  const y = TICKET.y;
  const recipe = RECIPES[order.dishId];
  const fraction = Math.max(0, order.patience / order.patienceMax);
  ctx.save();
  // Pin and card.
  ctx.fillStyle = COLORS.ticket;
  roundRect(ctx, x, y, TICKET.width, TICKET.height, 7);
  ctx.fill();
  ctx.fillStyle = '#c33';
  ctx.beginPath();
  ctx.arc(x + TICKET.width / 2, y + 6, 4.5, 0, Math.PI * 2);
  ctx.fill();
  drawBowl(ctx, x + 37, y + 48, 27, recipe.needs, 'cooked', t);
  // Name.
  ctx.fillStyle = COLORS.ticketInk;
  ctx.font = 'bold 14.5px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const name = recipe.name.length > 19 ? recipe.name.slice(0, 18) + '…' : recipe.name;
  ctx.fillText(name, x + 70, y + 30);
  // Recipe icons.
  recipe.needs.forEach((id, i) => {
    drawIngredientIcon(ctx, id, x + 84 + i * 30, y + 58, 11.5, INGREDIENTS[id].needsChop);
  });
  ctx.fillStyle = 'rgba(58,44,32,0.65)';
  ctx.font = '11px Verdana, sans-serif';
  ctx.fillText(`$${recipe.price}`, x + 70, y + 84);
  // Patience bar: green draining to a flashing red.
  ctx.fillStyle = 'rgba(58,44,32,0.18)';
  roundRect(ctx, x + 8, y + TICKET.height - 9, TICKET.width - 16, 5, 2.5);
  ctx.fill();
  const urgent = fraction < 0.3;
  ctx.fillStyle = urgent ? (Math.sin(t * 10) > 0 ? '#e2483d' : '#ff7a5e') : fraction < 0.6 ? '#e0a83c' : '#57b24a';
  if (fraction > 0) {
    roundRect(ctx, x + 8, y + TICKET.height - 9, (TICKET.width - 16) * fraction, 5, 2.5);
    ctx.fill();
  }
  ctx.restore();
}

/** The top strip: "ORDER BOARD" label, the tickets, and the shift clock, coins and hearts. */
function drawOrderBoard(ctx, world) {
  ctx.fillStyle = COLORS.boardFace;
  roundRect(ctx, BOARD.x, BOARD.y, BOARD.width, BOARD.height, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 2;
  ctx.stroke();
  world.orders.forEach((order, i) => drawTicket(ctx, order, i, world.animT));
  if (world.orders.length === 0 && world.screen === SCREEN_PLAY) {
    ctx.fillStyle = 'rgba(247,234,210,0.55)';
    ctx.font = 'italic 17px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('The board is quiet… the next customer is on their way.', TICKET.x + 6, 84);
  }
  // Clock, coins, hearts on the right of the board.
  const seconds = Math.ceil(world.timeLeft);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = world.timeLeft <= 20 && world.screen === SCREEN_PLAY ? '#ff7a5e' : COLORS.cream;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(clock, 1236, 72);
  ctx.font = '11px Verdana, sans-serif';
  ctx.fillStyle = 'rgba(247,234,210,0.7)';
  ctx.fillText('SHIFT TIMER', 1236, 92);
  ctx.fillStyle = '#ffd75e';
  ctx.beginPath();
  ctx.arc(1012, 106, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 19px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${world.coins}`, 1026, 113);
  for (let i = 0; i < TIMING.hearts; i += 1) drawHeart(ctx, 1150 + i * 30, 100, 11, i < world.hearts);
}

/** A wooden counter with its name plate; highlighted in brass while the chef can work it. */
function drawCounter(ctx, key, rect, active) {
  ctx.fillStyle = COLORS.counter;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, rect.x, rect.y, rect.width, 26, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(rect.x, rect.y + 22, rect.width, 4);
  if (active) {
    ctx.strokeStyle = COLORS.brass;
    ctx.lineWidth = 3.4;
    roundRect(ctx, rect.x - 3, rect.y - 3, rect.width + 6, rect.height + 6, 10);
    ctx.stroke();
    ctx.fillStyle = COLORS.brass;
    roundRect(ctx, rect.x + rect.width / 2 - 13, rect.y - 26, 26, 20, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 13px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', rect.x + rect.width / 2, rect.y - 11.5);
  }
}

/** A counter's name plate, drawn over its contents so a busy counter never hides its name. */
function drawStationLabel(ctx, rect) {
  ctx.font = 'bold 11.5px Verdana, sans-serif';
  ctx.textAlign = 'center';
  const text = rect.label.toUpperCase();
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(23,20,42,0.62)';
  roundRect(ctx, rect.x + rect.width / 2 - width / 2, rect.y + rect.height - 21, width, 17, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.cream;
  ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height - 8.5);
}

/** What sits on each counter: ingredient piles, the board, the pot, the burners, the pass. */
function drawStationContents(ctx, world, key, rect) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + 44;
  const t = world.animT;
  switch (key) {
    case 'noodleCrate':
      drawIngredientIcon(ctx, 'noodles', cx - 26, cy, 19);
      drawIngredientIcon(ctx, 'noodles', cx + 24, cy + 4, 17);
      break;
    case 'eggBasket':
      drawIngredientIcon(ctx, 'egg', cx - 24, cy, 15);
      drawIngredientIcon(ctx, 'egg', cx + 4, cy - 6, 15);
      drawIngredientIcon(ctx, 'egg', cx + 28, cy + 5, 14);
      break;
    case 'greensCrate':
      drawIngredientIcon(ctx, 'greens', cx - 22, cy, 19);
      drawIngredientIcon(ctx, 'greens', cx + 24, cy + 2, 17);
      break;
    case 'chiliCrate':
      drawIngredientIcon(ctx, 'chili', cx - 22, cy, 18);
      drawIngredientIcon(ctx, 'chili', cx + 24, cy, 17);
      break;
    case 'choppingBoard': {
      ctx.fillStyle = '#d9b77c';
      roundRect(ctx, rect.x + 18, rect.y + 26, rect.width - 36, 40, 6);
      ctx.fill();
      ctx.strokeStyle = '#a5824e';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (world.board !== null) {
        drawIngredientIcon(ctx, world.board.id, cx, cy + 2, 17, world.board.chops >= TIMING.chopsNeeded);
        // Chop pips along the board's near edge.
        for (let i = 0; i < TIMING.chopsNeeded; i += 1) {
          ctx.fillStyle = i < world.board.chops ? COLORS.good : 'rgba(34,26,20,0.3)';
          ctx.beginPath();
          ctx.arc(cx - 16 + i * 16, rect.y + 60, 4.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // The knife rests on the empty board.
        ctx.strokeStyle = '#c8ccd4';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy + 8);
        ctx.lineTo(cx + 14, cy - 6);
        ctx.stroke();
        ctx.strokeStyle = '#5a3a1e';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 6);
        ctx.lineTo(cx + 26, cy - 12);
        ctx.stroke();
      }
      break;
    }
    case 'bowlStack':
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = i === 2 ? '#f2eee2' : '#ddd6c4';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10 - i * 8, 30, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90,70,40,0.4)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      break;
    case 'brothPot': {
      ctx.fillStyle = '#3c3f4a';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 44, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c97b2d';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,160,0.75)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(cx - 6, cy - 3, 18, 8, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      drawSteam(ctx, cx, cy - 16, t);
      break;
    }
    case 'stove': {
      world.burners.forEach((burner, i) => {
        const bx = BURNERS[i].x;
        const by = rect.y + 42;
        ctx.fillStyle = '#26242e';
        ctx.beginPath();
        ctx.arc(bx, by, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4c4a58';
        ctx.lineWidth = 3;
        ctx.stroke();
        if (burner === null) return;
        // Flame while it cooks, embers once it burns.
        if (burner.state === 'cooking') {
          ctx.fillStyle = `rgba(255,${120 + Math.round(60 * Math.sin(t * 13 + i * 2))},30,0.85)`;
          for (let f = -1; f <= 1; f += 1) {
            ctx.beginPath();
            ctx.ellipse(bx + f * 15, by + 16, 6, 10 + Math.sin(t * 11 + f) * 2.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        drawBowl(ctx, bx, by - 6, 27, burner.contents, burner.state === 'cooking' ? 'raw' : burner.state, t);
        // Progress ring: fills amber while cooking, green when done, red as it burns.
        const frac = Math.min(1, burner.t / TIMING.burnSeconds);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 4.6;
        ctx.beginPath();
        ctx.arc(bx, by - 6, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = burner.state === 'burnt' ? '#e2483d' : burner.state === 'cooked' ? '#57b24a' : '#e0a83c';
        ctx.beginPath();
        ctx.arc(bx, by - 6, 35, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
      });
      break;
    }
    case 'passCounter': {
      if (world.pass !== null) {
        ctx.fillStyle = '#f7ead2';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 40, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        drawBowl(ctx, cx, cy, 27, world.pass.contents, world.pass.state, t);
        ctx.fillStyle = COLORS.good;
        roundRect(ctx, cx - 27, rect.y - 4, 54, 17, 5);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10.5px Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('READY', cx, rect.y + 8.5);
      } else {
        ctx.fillStyle = 'rgba(247,234,210,0.5)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 38, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'serveWindow': {
      ctx.fillStyle = '#17142a';
      roundRect(ctx, rect.x + 16, rect.y + 8, rect.width - 32, 46, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,190,90,0.35)';
      roundRect(ctx, rect.x + 20, rect.y + 12, rect.width - 40, 38, 5);
      ctx.fill();
      // The service bell.
      ctx.fillStyle = COLORS.brass;
      ctx.beginPath();
      ctx.arc(cx, cy + 16, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 2.4, cy + 2, 4.8, 5);
      break;
    }
    case 'trashBin':
      ctx.fillStyle = '#4c4a58';
      roundRect(ctx, cx - 20, rect.y + 22, 40, 42, 5);
      ctx.fill();
      ctx.fillStyle = '#63616f';
      ctx.fillRect(cx - 24, rect.y + 18, 48, 8);
      break;
    default:
      break;
  }
}

/** Floating score text and the transient hint pill along the bottom. */
function drawFloatsAndHint(ctx, world) {
  ctx.textAlign = 'center';
  for (const f of world.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 25px Georgia, serif';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  if (world.hint !== null && world.animT < world.hint.until) {
    ctx.font = '15.5px Verdana, sans-serif';
    const width = ctx.measureText(world.hint.text).width + 34;
    ctx.fillStyle = 'rgba(23,20,42,0.88)';
    roundRect(ctx, 640 - width / 2, 756, width, 30, 15);
    ctx.fill();
    ctx.fillStyle = COLORS.cream;
    ctx.fillText(world.hint.text, 640, 776.5);
  }
}

/** The title screen: the kitchen behind, a hanging sign, the recipes and the controls. */
function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(15,13,29,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  // Hanging sign.
  ctx.strokeStyle = '#0f0d1d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(430, 150);
  ctx.lineTo(490, 218);
  ctx.moveTo(850, 150);
  ctx.lineTo(790, 218);
  ctx.stroke();
  ctx.fillStyle = '#8a5a33';
  roundRect(ctx, 390, 218, 500, 104, 14);
  ctx.fill();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffd75e';
  ctx.font = 'bold 47px Georgia, serif';
  ctx.fillText('NOODLE NIGHT MARKET', 640, 268);
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'italic 17.5px Georgia, serif';
  ctx.fillText('One cook. Four bowls. A whole night market to feed.', 640, 300);
  // How to play.
  ctx.fillStyle = 'rgba(23,20,42,0.92)';
  roundRect(ctx, 340, 348, 600, 218, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,168,60,0.6)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = COLORS.cream;
  ctx.font = '15.5px Verdana, sans-serif';
  const lines = [
    'WASD / arrows — walk the kitchen      E / Space — work a station',
    'Click a counter to walk there and work it',
    'Take a bowl, fill it to match a ticket: chop greens & chili first,',
    'cook on the wok stove, serve at the window before patience runs out.',
    'Park a finished dish on the PASS. Watch the ring — burnt bowls feed no one.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 388 + i * 27));
  ctx.fillStyle = '#ffd75e';
  ctx.font = 'bold 16.5px Verdana, sans-serif';
  ctx.fillText('M — mute', 640, 388 + lines.length * 27);
  // Start prompt.
  ctx.fillStyle = Math.sin(world.animT * 3.4) > -0.2 ? '#ffd75e' : 'rgba(255,215,94,0.35)';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('CLICK OR PRESS ENTER TO OPEN THE STALL', 640, 640);
}

/** The results screen: the night's takings, the stars they earn, and the way back in. */
function drawResults(ctx, world) {
  ctx.fillStyle = 'rgba(15,13,29,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = 'rgba(23,20,42,0.95)';
  roundRect(ctx, 415, 218, 450, 330, 14);
  ctx.fill();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.cream;
  ctx.font = 'bold 33px Georgia, serif';
  ctx.fillText(world.hearts <= 0 ? 'THE CROWD GAVE UP' : 'SHIFT OVER', 640, 272);
  const stars = starsFor(world.coins);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < stars ? '#ffd75e' : 'rgba(247,234,210,0.22)';
    ctx.font = '44px Georgia, serif';
    ctx.fillText('★', 592 + i * 48, 322);
  }
  ctx.font = '19px Verdana, sans-serif';
  ctx.fillStyle = COLORS.cream;
  const rows = [
    `Coins earned:  ${world.coins}`,
    `Bowls served:  ${world.served}`,
    `Orders lost:  ${world.missed}`,
    `Best night:  ${Math.max(world.best, world.coins)}`,
  ];
  rows.forEach((row, i) => ctx.fillText(row, 640, 368 + i * 34));
  ctx.fillStyle = '#ffd75e';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText('CLICK OR PRESS ENTER TO COOK AGAIN', 640, 522);
}

/** Draw the whole frame for the world's current screen. */
export function drawScene(ctx, world) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawRoom(ctx, world.animT);
  drawOrderBoard(ctx, world);
  const active = world.screen === SCREEN_PLAY ? stationInReach(world) : null;
  for (const [key, rect] of Object.entries(STATIONS)) {
    drawCounter(ctx, key, rect, key === active);
    drawStationContents(ctx, world, key, rect);
  }
  for (const rect of Object.values(STATIONS)) drawStationLabel(ctx, rect);
  drawChef(ctx, world.chef.x, world.chef.y, world.chef.facing, world.carry, world.chef.walkPhase, world.animT);
  drawFloatsAndHint(ctx, world);
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, world);
  if (world.screen === SCREEN_OVER) drawResults(ctx, world);
}
