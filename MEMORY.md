# Project memory

## Product and user preferences

- Worldsmith is a local procedural fantasy world generator and editor with a premium illustrated dark fantasy atlas presentation. Preserve the existing UI, style and object library while improving it.
- Required workflow: Generate → Edit → Add POI → Save → Load → Export PNG/JSON. Beautiful static exports alone do not satisfy the user: the working editor must also be sharp and responsive.
- Latest feature iteration is patch v0.5: camera/brush performance, continuous world rendering, terrain, water/coasts, culling and workers. It is implemented in part; acceptance is not yet complete. See `TODO.md` and `VALIDATION.md`.
- Explicit user preference: preserve `0.0.0.0` server binding. Default port 4173; `PORT` overrides it.
- User requested rolling AI development records after each actionable prompt; their maintenance rules live in `AGENTS.md`.

## Repository and runtime

- Private repository: https://github.com/EchoOfHONK/worldsmith ; default branch `main`.
- The app root contains `package.json`, `index.html`, `src/`, `assets/` and tests. The original copied parent folder also contained archives and scratch work; those are not part of this repository.
- Node.js 18+ serves static files via `server.cjs`; browser code is vanilla JavaScript attached to global `WS`. No React, bundler, backend database or required runtime npm dependencies.
- `index.html` loads modules in order. `ui.js` creates `WS.app.editor`; `library-ui.js`, `quality-ui.js` and `performance-ui.js` extend that instance.
- Keep existing Russian interface copy consistent; documentation here is English for agent navigation. Do not infer a blanket translation request.

## Architecture worth remembering

- `config.js` and `catalog.js`: generation parameters, presets, biomes, styles and object definitions. `render-config.js`: render budgets and LOD policy.
- `generator.js` builds global terrain, climate, drainage, rivers, biomes and placements from a seed. `generator-worker.js` exposes background generation and progress.
- `Editor` owns input, camera and undo. Brush strokes store changed cells; other edits use project snapshots. History is capped at 25 operations with an approximate 64 MB budget.
- `ViewportRenderer` transforms a cached viewport during movement and composes worker-produced chunks. `RenderService` queues jobs; `render-worker.js` owns offscreen rasterization and export bands.
- Important hidden connection: `terrain-tiles.js` wraps `WS.surface.invalidate` to invalidate coast distance, terrain tiles and spatial scene caches. Do not diagnose a missing invalidation by reading `surface.js` alone.
- `world-scene.js` indexes objects and deterministic mountain/forest blocks. World-space noise and padded bounds prevent chunk-local patterns and clipped objects.
- Editor labels use SVG; exported labels use Canvas with worker-loaded bundled fonts.
- Current screen-chunk cache budget is 192 MiB, distinct from terrain/asset caches and total process/GPU memory. Preserve DPR in Performance and Balanced modes.

## Data and assets

- App package version is `0.5.0`; saved-world schema remains v2. `storage.js` validates data and `model.js` migrates v1. See `DATA_FORMAT.md`.
- Grid cells are 5 world pixels. Custom dimensions are 300–3200 on each side. Export long edges include 2048/4096/8192 with aspect ratio preserved.
- Custom PNG/WebP assets live in IndexedDB and are embedded into saved JSON for portability. Validation limits include 100 assets / 30 MB serialized collection and 4096-pixel source sides.
- The catalog has 104 configured object types; some share artwork. Bundled atlases and four master images have finite source detail. Do not claim that upscaling creates missing detail. Provenance and font licenses are in `ASSETS.md` and `assets/fonts/`.
- Manual terrain edits do not automatically recompute existing rivers, roads or climate globally; do not imply they do.

## Evidence and current limits

- 2026-09-15: `npm test` passed 24 model/editor checks and 2 render-service lifecycle checks. It rewrites the demo JSON as a side effect.
- Current browser evidence and unconfirmed checks are in `VALIDATION.md`. Earlier copied reports do not certify this revision. Stable 60 FPS and absence of whole-process memory growth remain unverified.
- The local sandbox blocked standalone Playwright/Chrome launch; the app worked in the in-app Chromium browser. This is an environment limitation, not proof of an application defect.
