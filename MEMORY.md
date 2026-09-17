# Project memory

## Product and user preferences

- Worldsmith is a local procedural fantasy world generator and editor with a premium illustrated dark fantasy atlas presentation. Preserve the existing UI, style and object library while improving it.
- Required workflow: Generate → Edit → Add POI → Save → Load → Export PNG/JSON. Beautiful static exports alone do not satisfy the user: the working editor must also be sharp and responsive.
- v0.6 prioritizes a cohesive illustrated editor at 50/100/150/200%, maximum zoom 2×. The user explicitly superseded extreme deep zoom. See TODO.md and VALIDATION.md.
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
- Current screen-chunk cache budget is 128 MiB, distinct from terrain/asset caches and total process/GPU memory. Preserve DPR in Performance and Balanced modes.

## Data and assets

- App package version is `0.7.0`; saved-world schema remains v2. `storage.js` validates data and `model.js` migrates v1. See `DATA_FORMAT.md`.
- Grid cells are 5 world pixels. Custom dimensions are 300–3200 on each side. Export long edges include 2048/4096/8192 with aspect ratio preserved.
- Custom PNG/WebP assets live in IndexedDB and are embedded into saved JSON for portability. Validation limits include 100 assets / 30 MB serialized collection and 4096-pixel source sides.
- The catalog has 104 configured object types; some share artwork. Bundled atlases and four master images have finite source detail. Do not claim that upscaling creates missing detail. Provenance and font licenses are in `ASSETS.md` and `assets/fonts/`.
- Manual terrain edits do not automatically recompute existing rivers, roads or climate globally; do not imply they do.

## Evidence and current limits

- 2026-09-17: `npm test` passes 57 checks (24 model/editor, 2 service lifecycle, 17 focused atlas, 14 continuity). It regenerates the canonical demo JSON; v0.7 intentionally updates the bundled demo to the new composition.
- Current browser evidence and unconfirmed checks are in `VALIDATION.md`. Earlier copied reports do not certify this revision. Stable 60 FPS and absence of whole-process memory growth remain unverified.
- Standalone bundled Playwright Chromium works in the Windows workspace; the earlier launch restriction was environment-specific. Tests accept WORLDSMITH_BASE_URL for an alternate server port. Run timing benchmarks separately from rendering/export workloads.

- Worker font loader must be named loadFonts: a top-level fonts function shadows WorkerGlobalScope.fonts and breaks PNG export. Browser export coverage guards this.

## Focused atlas policy

- Logical zoom remains separate from raster sampling. The 2× cap applies to zoom controls, wheel and fit. Macro art no longer decomposes; stable world materials appear across the range.
- Viewport keys include raster LOD and explicit object-visibility signature, but not every tiny zoom change. This avoids redundant worker draws while respecting optional min/maxZoom. Labels stay SVG.
- atlas-style.js supplies cached smooth path geometry, ground overlays, source-sized edge feathers and POI footing. World-scene uses stable coordinate hashes for varied forest/mountain art and clearings. See SEMANTIC_ZOOM.md.
- Generator road endpoints must copy POI positions rather than share mutable objects. New generation adds short access trails, but old saved worlds are not regenerated.
- Object-only edits patch old/new footprint union; terrain edits preserve bounded invalidation. Material cache remains 256 patches, worker terrain cache 32 tiles.
- The optional tile exporter now uses logical maxZoom 2, default DPR 2, renderModel atlas-v7 and cache algorithm 3. ElderMar top extent is 7200×4800. PNG 2K/4K/8K is unchanged.
- Saved schema stays v2 with existing detailModel defaults. Source/master/custom warnings remain; fixed-range rendering does not create pixels missing from source art.
- The user supplied the reference image on 2026-09-17. v0.7 prioritizes global composition before terrain/POI/detail; see WORLD_LAYOUT.md. Do not claim an exact match to the painting.
- New worlds have an optional validated worldLayout v1 block: generation provenance only. Existing v1/v2 saves are never regenerated. Six smooth character influences guide global fields; render chunks remain delivery partitions.
- Detached snow fragments at the top of tree atlas crops caused repeated horizontal strips. atlas-style.removeBleed fixes source preparation in both previews and workers. Whole/split equality alone cannot detect source-art contamination.

- Generator decoration clearance and scene culling share objects.bounds; do not use anchor distance alone to prevent waterfalls/rocks covering tall landmarks. All crossings/access paths are placed before local decoration.
