// The recipe book of Noodle Night Market: the five things on the counter and the four bowls the
// night crowd orders. A dish is the exact set of ingredients in the bowl once it leaves the
// stove — nothing more, nothing hidden — so an order ticket can show its recipe as pictures and
// the cook can plan a route: chop first, then fill, then cook.

/**
 * Ingredients by id. `needsChop` marks what must visit the chopping board before it can go in a
 * bowl; `from` names the station that hands it out.
 */
export const INGREDIENTS = {
  noodles: { name: 'Noodles', from: 'noodleCrate', needsChop: false },
  egg: { name: 'Egg', from: 'eggBasket', needsChop: false },
  greens: { name: 'Greens', from: 'greensCrate', needsChop: true },
  chili: { name: 'Chili', from: 'chiliCrate', needsChop: true },
  broth: { name: 'Broth', from: 'brothPot', needsChop: false },
};

/** The crate or pot that hands out each ingredient, by ingredient id. */
export const SOURCE_STATION = Object.fromEntries(
  Object.entries(INGREDIENTS).map(([id, def]) => [id, def.from]),
);

/** Recipes by dish id: name, the ingredient ids in the bowl, the menu price in coins. */
export const RECIPES = {
  classicSoup: { name: 'Classic Noodle Soup', needs: ['noodles', 'broth', 'greens'], price: 30 },
  dragonNoodles: { name: 'Dragon Fire Noodles', needs: ['noodles', 'chili', 'egg'], price: 36 },
  gardenBroth: { name: 'Garden Broth Bowl', needs: ['broth', 'greens', 'egg'], price: 34 },
  firecrackerSoup: { name: 'Firecracker Soup', needs: ['noodles', 'broth', 'chili', 'egg'], price: 46 },
};

/** Dish ids in the order the crowd learns to ask for them; the ramp unlocks them by index. */
export const RECIPE_ORDER = ['classicSoup', 'gardenBroth', 'dragonNoodles', 'firecrackerSoup'];

/**
 * The dish a bowl of `contents` becomes on the stove: the recipe whose needs are exactly the
 * bowl's contents, or null when no dish matches (it still cooks — into nameless mush a customer
 * will refuse, worth nothing but a trip to the trash).
 */
export function dishForContents(contents) {
  for (const id of RECIPE_ORDER) {
    const needs = RECIPES[id].needs;
    if (needs.length === contents.length && needs.every((need) => contents.includes(need))) return id;
  }
  return null;
}

/** Best tip a fast serve can earn, scaled by the patience left on the ticket. */
export const MAX_TIP = 20;
