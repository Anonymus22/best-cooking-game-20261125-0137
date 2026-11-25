# Noodle Night Market

An original cooking game for make.fun's *Make the best cooking game* bounty.

[![Competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/Anonymus22/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

One cook, one wok stove, and a night market that all wants feeding at once. Tickets land on the
order board — Classic Noodle Soup, Garden Broth Bowl, Dragon Fire Noodles, Firecracker Soup —
and each one shows its recipe as pictures. Take a bowl, fill it to match: noodles and eggs go
straight in, greens and chili detour through the chopping board, broth comes from the pot. Cook
the bowl on a burner (watch the ring: gold while it cooks, green when it is done, red as it
burns), park finished dishes on the pass, and serve at the window before the ticket's patience
bar runs out. Fast serves earn tips; walked-away orders cost hearts. The rush thickens over the
150-second shift — tighter spawns, thinner patience, hotter recipes.

## Play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and visit
http://localhost:8080). No build step, no network: the game is plain static files.

- **WASD / arrow keys** — walk the kitchen
- **E / Space** — work the station in reach (pick up, chop, cook, serve…)
- **Mouse** — click a counter to walk there and work it; click to start
- **Enter** — start / restart a shift
- **M** — mute the kitchen sounds (all synthesized live with WebAudio, no audio files)

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/index.html` — the page; `game/style.css` — the page around the canvas.
- `game/src/config.js` — floor plan, stations, timings, palette.
- `game/src/recipes.js` — the ingredients and the four dishes they combine into.
- `game/src/world.js` — the simulation: orders, cooking, serving, scoring.
- `game/src/render.js` — the kitchen, order board and screens, drawn on canvas.
- `game/src/food-art.js` — the food and the chef, drawn as vector art.
- `game/src/audio.js` — synthesized chops, sizzles and the service bell.
- `game/src/input.js` — keyboard and mouse.
- `game/src/shots.js` — the staged scenes the screenshots were taken from (`?shot=cover` etc.).
- `game/src/main.js` — the shell: canvas, clock, sound, screen flow.
- `screenshots/` — real renders of the game in a browser; the first is the cover.

## License

MIT — see `LICENSE`.
