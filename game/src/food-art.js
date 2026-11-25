// The food and the cook, drawn as canvas vector art: noodle nests, eggs, leafy greens, chilies,
// broth, and the bowls they become — raw, cooking, steaming, or burnt. Every dish picture the
// order tickets, the counters and the chef's hands show comes from here, so the game reads the
// same everywhere.

/** A wavy noodle strand path across a width, drawn `rows` times down a height. */
function noodleSquiggles(ctx, x, y, width, rows, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let row = 0; row < rows; row += 1) {
    const yy = y + row * 6;
    ctx.beginPath();
    for (let px = 0; px <= width; px += 4) {
      const wave = Math.sin((px / width) * Math.PI * 3 + row * 1.7) * 2.4;
      if (px === 0) ctx.moveTo(x + px, yy + wave);
      else ctx.lineTo(x + px, yy + wave);
    }
    ctx.stroke();
  }
}

/** One leaf: a pointed oval with a centre vein, rotated by `angle`. */
function leaf(ctx, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.75, 0, 0, size);
  ctx.quadraticCurveTo(-size * 0.75, 0, 0, -size);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,60,20,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.stroke();
  ctx.restore();
}

/** One chili pod: a curved red teardrop with a green stem. */
function chiliPod(ctx, x, y, size, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#d63a2a';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.quadraticCurveTo(size * 0.85, size * 0.1, size * 0.25, size);
  ctx.quadraticCurveTo(0, size * 0.45, -size * 0.5, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.35, 0, -size * 0.2);
  ctx.fill();
  ctx.strokeStyle = '#3f7a2e';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.55, size * 0.35, -size * 0.6);
  ctx.stroke();
  ctx.restore();
}

/** A halved boiled egg: white oval, golden yolk. */
function eggHalf(ctx, x, y, r) {
  ctx.fillStyle = '#fff8ec';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5a623';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Small round icon of one ingredient, for order tickets, the chef's hands and counter labels.
 * `chopped` draws greens and chili cut (smaller pieces, on a board tint) instead of whole.
 */
export function drawIngredientIcon(ctx, id, x, y, r, chopped = false) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'noodles') {
    ctx.fillStyle = '#a5672a';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r * 1.05, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    noodleSquiggles(ctx, -r * 0.8, -r * 0.35, r * 1.6, 3, '#f0c75e');
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8ec';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.72, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,40,0.35)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.arc(0, r * 0.18, r * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'greens') {
    if (chopped) {
      leaf(ctx, -r * 0.35, 0, r * 0.55, -0.7, '#58a34c');
      leaf(ctx, r * 0.3, r * 0.2, r * 0.5, 0.8, '#6fbf5e');
      leaf(ctx, r * 0.05, -r * 0.3, r * 0.45, 0.2, '#4c9440');
    } else {
      leaf(ctx, -r * 0.3, r * 0.15, r * 0.8, -0.5, '#58a34c');
      leaf(ctx, r * 0.32, r * 0.1, r * 0.85, 0.55, '#6fbf5e');
      leaf(ctx, 0, -r * 0.25, r * 0.7, 0, '#4c9440');
    }
  } else if (id === 'chili') {
    if (chopped) {
      chiliPod(ctx, -r * 0.3, r * 0.1, r * 0.55, -0.9);
      chiliPod(ctx, r * 0.35, -r * 0.05, r * 0.5, 0.7);
    } else {
      chiliPod(ctx, -r * 0.25, 0, r * 0.95, -0.5);
      chiliPod(ctx, r * 0.3, r * 0.1, r * 0.85, 0.6);
    }
  } else if (id === 'broth') {
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.95, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c97b2d';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.82, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.05, r * 0.4, r * 0.18, -0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Rising steam curls above a hot bowl; `t` animates them, `dark` makes it smoke instead. */
export function drawSteam(ctx, x, y, t, dark = false) {
  ctx.save();
  ctx.strokeStyle = dark ? 'rgba(40,36,32,0.6)' : 'rgba(255,250,240,0.55)';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    const sway = Math.sin(t * 2.2 + i * 1.9) * 4;
    ctx.beginPath();
    ctx.moveTo(x + i * 13, y);
    ctx.quadraticCurveTo(x + i * 13 + sway, y - 13, x + i * 13 - sway, y - 27);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A bowl seen from a three-quarter top view: its contents as a filled surface — broth turns it
 * amber, noodles show as squiggles, toppings sit on top. State says how it left the kitchen:
 * 'raw' pale, 'cooked' glossy with steam handled by the caller, 'burnt' blackened, 'mush' a
 * grey-brown swamp no recipe owns.
 */
export function drawBowl(ctx, x, y, r, contents, state, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  // Bowl body: a deep enamel bowl with a brass rim.
  ctx.fillStyle = state === 'burnt' ? '#3a332c' : '#e8e3d8';
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.25);
  ctx.quadraticCurveTo(-r * 0.92, r * 0.75, 0, r * 0.82);
  ctx.quadraticCurveTo(r * 0.92, r * 0.75, r, -r * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.86, r * 0.52, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // The surface: broth, dry noodles, mush or burnt crust.
  const hasBroth = contents.includes('broth');
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.25, r * 0.98, r * 0.42, 0, 0, Math.PI * 2);
  if (state === 'burnt') ctx.fillStyle = '#241d16';
  else if (state === 'mush') ctx.fillStyle = '#7d6a4f';
  else if (hasBroth) ctx.fillStyle = state === 'cooked' ? '#d98a35' : '#c97b2d';
  else ctx.fillStyle = '#e9d9ae';
  ctx.fill();
  ctx.strokeStyle = '#e0a83c';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  if (state !== 'burnt') {
    if (contents.includes('noodles')) noodleSquiggles(ctx, -r * 0.62, -r * 0.38, r * 1.24, 3, state === 'mush' ? '#9a8a68' : '#f0c75e');
    if (contents.includes('greens')) {
      leaf(ctx, -r * 0.3, -r * 0.28, r * 0.3, -0.6, '#58a34c');
      leaf(ctx, r * 0.28, -r * 0.2, r * 0.26, 0.7, '#6fbf5e');
    }
    if (contents.includes('chili')) {
      chiliPod(ctx, r * 0.05, -r * 0.3, r * 0.34, 0.4);
      chiliPod(ctx, -r * 0.45, -r * 0.18, r * 0.28, -0.8);
    }
    if (contents.includes('egg')) eggHalf(ctx, r * 0.42, -r * 0.3, r * 0.3);
  } else {
    ctx.fillStyle = '#171310';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.28, r * 0.3, r * 0.12, 0.4, 0, Math.PI * 2);
    ctx.ellipse(r * 0.3, -r * 0.2, r * 0.24, r * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (state === 'cooked') drawSteam(ctx, x, y - r * 0.75, t);
  if (state === 'burnt') drawSteam(ctx, x, y - r * 0.75, t, true);
}

/**
 * The chef: a round cook in a white hat and a rust-red apron, drawn facing `facing` (a unit
 * vector). Whatever the hands carry is drawn held out front; `walkPhase` bobs the body.
 */
export function drawChef(ctx, x, y, facing, carry, walkPhase, t) {
  const bob = Math.sin(walkPhase) * 2.2;
  ctx.save();
  ctx.translate(x, y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 26 - bob, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body and apron.
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.arc(0, 4, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3402e';
  ctx.beginPath();
  ctx.arc(0, 10, 17, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.quadraticCurveTo(0, 26, -17 * Math.cos(0.15 * Math.PI), 10 + 17 * Math.sin(0.15 * Math.PI));
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f0bd8a';
  ctx.beginPath();
  ctx.arc(0, -22, 15, 0, Math.PI * 2);
  ctx.fill();
  // Hat: band and puffed top.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-14, -36, 28, 7);
  ctx.beginPath();
  ctx.arc(-8, -38, 8, 0, Math.PI * 2);
  ctx.arc(0, -42, 9.5, 0, Math.PI * 2);
  ctx.arc(8, -38, 8, 0, Math.PI * 2);
  ctx.fill();
  // Face, turned toward the facing direction.
  const fx = facing.x * 3.4;
  const fy = facing.y * 2.2;
  ctx.fillStyle = '#2b1c10';
  ctx.beginPath();
  ctx.arc(-5 + fx, -22 + fy, 1.9, 0, Math.PI * 2);
  ctx.arc(5 + fx, -22 + fy, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1c10';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(fx, -17 + fy, 4.6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Arms reaching forward, and whatever they carry.
  const ax = facing.x * 20;
  const ay = 8 + facing.y * 12;
  ctx.strokeStyle = '#f0bd8a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, 2);
  ctx.lineTo(ax - 6, ay);
  ctx.moveTo(13, 2);
  ctx.lineTo(ax + 6, ay);
  ctx.stroke();
  if (carry !== null) {
    const hx = ax;
    const hy = ay - 8;
    if (carry.kind === 'bowl') drawBowl(ctx, hx, hy, 21, carry.contents, carry.state, t);
    else drawIngredientIcon(ctx, carry.id, hx, hy, 15, carry.chopped);
  }
  ctx.restore();
}
