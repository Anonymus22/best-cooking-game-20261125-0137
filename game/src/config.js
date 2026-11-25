// Layout and tuning for Noodle Night Market: the canvas size, the kitchen's stations as
// rectangles on the floor plan, and every timing the simulation runs on. Nothing here draws or
// decides; it only names the numbers the other files share.

export const VIEW = { width: 1280, height: 800 };

/** The top strip of the room: order board, shift clock, coins and hearts live here. */
export const BOARD = { x: 24, y: 16, width: 1232, height: 118 };

/** Floor the chef can walk on; stations ring its edges and are used from inside it. */
export const FLOOR = { x: 40, y: 190, width: 1200, height: 560 };

export const CHEF = { radius: 26, speed: 300, startX: 640, startY: 470 };

/** How close the chef must stand to a station to work it with E / Space or a click. */
export const REACH = 118;

/**
 * Every workstation, by key. `side` says which way the chef faces it and where its counter art
 * sits; x/y/width/height is the counter itself, drawn at the floor's edge.
 */
export const STATIONS = {
  noodleCrate: { label: 'Noodle Nests', x: 60, y: 210, width: 150, height: 84 },
  eggBasket: { label: 'Egg Basket', x: 60, y: 330, width: 150, height: 84 },
  greensCrate: { label: 'Greens Crate', x: 60, y: 450, width: 150, height: 84 },
  chiliCrate: { label: 'Chili Crate', x: 60, y: 570, width: 150, height: 84 },
  choppingBoard: { label: 'Chopping Board', x: 250, y: 640, width: 190, height: 84 },
  bowlStack: { label: 'Bowl Stack', x: 480, y: 640, width: 150, height: 84 },
  brothPot: { label: 'Broth Pot', x: 670, y: 640, width: 170, height: 84 },
  stove: { label: 'Wok Stove', x: 880, y: 640, width: 210, height: 84 },
  passCounter: { label: 'Pass', x: 1070, y: 450, width: 150, height: 84 },
  serveWindow: { label: 'Serve Window', x: 1070, y: 330, width: 150, height: 84 },
  trashBin: { label: 'Trash', x: 1070, y: 570, width: 150, height: 84 },
};

/** The two stove burners, left and right, each holding at most one bowl. */
export const BURNERS = [
  { x: 925, y: 682 },
  { x: 1045, y: 682 },
];

export const TIMING = {
  /** Length of one shift, in seconds. */
  shiftSeconds: 150,
  /** Seconds on the stove before a bowl is cooked through. */
  cookSeconds: 4.5,
  /** Seconds on the stove before a cooked bowl burns. */
  burnSeconds: 9,
  /** Chops needed to ready greens or chili on the board. */
  chopsNeeded: 3,
  /** Hearts the kitchen starts a shift with; an expired order costs one. */
  hearts: 3,
  /** First order arrives this many seconds into the shift. */
  firstOrderAt: 1.2,
};

/** How the rush grows: spawn gap and patience shrink, and the recipe pool widens, over time. */
export const RAMP = [
  { until: 45, spawnMin: 8, spawnMax: 11, patience: 62, maxOrders: 2, recipePool: 2 },
  { until: 95, spawnMin: 6.5, spawnMax: 9.5, patience: 54, maxOrders: 3, recipePool: 3 },
  { until: 150, spawnMin: 5, spawnMax: 8, patience: 46, maxOrders: 4, recipePool: 4 },
];

/** Palette: a warm night-market kitchen — indigo walls, lamplit wood, enamel and brass. */
export const COLORS = {
  wall: '#232038',
  wallTrim: '#17142a',
  boardFace: '#2e2a4a',
  ticket: '#f7ead2',
  ticketInk: '#3a2c20',
  floor: '#4a3428',
  floorLine: '#3c2a20',
  counter: '#8a5a33',
  counterTop: '#c98d4e',
  counterEdge: '#6e4525',
  brass: '#e0a83c',
  enamel: '#e8e3d8',
  danger: '#e2483d',
  good: '#57b24a',
  ink: '#221a14',
  cream: '#f7ead2',
  steam: 'rgba(255,250,240,0.55)',
};
