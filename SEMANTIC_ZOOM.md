# Semantic zoom implementation

## Baseline (2026-09-15)

`npm test`: 24 model/editor + 2 worker lifecycle checks pass. World coordinates and cell size belong to the v2 generator/model. Editor camera → viewport chunk cache → RenderService → render-worker → renderer → terrainTiles/worldScene is the active raster path. The worker draws master/source crops directly; main-thread asset LOD cannot add source detail. Existing terrain resolution levels resample one field; mountain/forest sprites and settlement icons have no semantic hierarchy. SVG labels are independent of chunks. PNG exports use worker bands but one final canvas.

## Design

Keep v2 geometry authoritative. Versioned, derived world-lattice features and parent-relative children are render-only. Logical semanticZoom controls existence/opacity; physical resolution controls sampling. Smooth overlapping bands and source warnings are centralized. No remote services, new framework or large base bitmap.

Implementation and measured acceptance are recorded in VALIDATION.md; persistence and package details belong in DATA_FORMAT.md.

## Render contract

- `semantic-lod.js` owns smoothstep weights: regional 1.25–3, hierarchy 2.5–5.5, inspection 5.5–8. DPR/quality never enters derived identity. IDs include seed, semantic layer, world lattice/parent ID and detail version/salt.
- The viewport sends `semanticZoom` separately from physical chunk `resolution`. Cache keys include logical zoom and quality. Camera/quality changes reuse the world specification without increasing worldRevision. Cache remains 192 MiB; terrain worker cache remains 32 tiles. Material patches have an independent 256-patch LRU.
- `world-detail.js` adds 4-world-unit lattice materials, shared path samples and hierarchical mountain/forest children. Materials are world-sized primitives (scree, snow breaks, stones, grass, cracks, roots/logs, puddles, reeds, foam and wavelets). Regional features fade in first; finer features appear in inspection. Surface height, shared coast distance and vegetation masks constrain them.
- Mountain children use 7–12-world-unit peak crops. Forests reveal 4–8-world-unit bundled oak/dead-tree/small conifer-group artwork and gaps. Parent IDs govern placement; nearby POIs, roads and rivers exclude trees. These are derived render elements, never new editable POIs.
- `settlement-detail.js` derives houses/farms/market pieces, ruin components/rubble, camps and port pieces within the existing footprint. It considers biome, nearby road heading, rotation/scale, water and river clearance. A parent is retained when a safe replacement is unavailable. Masters retain their illustration with foreground context rather than silently claiming more source detail.
- Editor labels remain SVG. Optional visibility ranges and importance are editable; automatic text size responds to logical zoom, while manual labels retain their chosen size and are exempt from declutter. PNG labels use the same visibility/size rules with worker-loaded fonts.
- Brush invalidation still patches cells. Object-only edits compare snapshots and invalidate old/new footprint union with 40-world-unit padding, update the spatial index and send an object patch to the worker. Terrain changes retain their existing coast/terrain padding; unrelated derived IDs remain stable.

## Source honesty

The worker measures actual requested physical width / native source width for every raster draw, including custom images. Ratios above 1.35 are reported as source-limited fallbacks. The limit allows bounded oversampling; it is not a claim of native source detail. Some illustrated landmarks, special fantasy props, waterfalls, individually oversized small buildings and user-scaled/custom images have no faithful local decomposition. They remain visible with a warning. New artwork is needed to improve their intrinsic resolution. Mid-transition macro sprites can also exceed the limit while fading out; inspection substitutes supported categories completely.

Debug macro/detail counts sum chunk draw occurrences, so an entity crossing chunk boundaries can be counted twice. Identity tests use unique stable IDs. Source ratios use actual chunk raster resolution, which may be the next configured raster LOD above the screen target.

## Export contract

Deep Zoom writes one bounded WebP tile at a time through a supplied writer. The UI uses a new subfolder of the chosen directory and supports cancellation. Default DPR 2 × logical 8 yields a 28,800×19,200 effective top level for ElderMar, built from 512-square tiles, never a canvas of that size. Raster tiles exclude labels/frame; roads/rivers/POI illustrations remain in the raster composition with structured copies in `vectors/`. GeoJSON coordinates are explicitly world pixels, not geographic coordinates. WebP is browser-encoded at quality 0.92.

The manifest contains levels, world extent, profile, detail version, project SHA-256, cache revision, exact coverage and source-limit summary. `affectedTiles(bounds, level, padding)` is the incremental invalidation primitive; this iteration rebuilds all requested tiles and does not reuse an existing package automatically. A bounds-limited package is explicitly marked partial. `complete:false` remains after failure/cancellation. Flattened PNG remains a derivative with a maximum 8192-pixel side and its existing final canvas; it is not used to build the pyramid.

## Changed files

- `ASSETS.md`
- `CONTENTS.md`
- `DATA_FORMAT.md`
- `MEMORY.md`
- `PROBLEMS.md`
- `README.md`
- `SEMANTIC_ZOOM.md`
- `TODO.md`
- `VALIDATION.md`
- `index.html`
- `package.json`
- `scripts/update-contents.cjs`
- `src/deep-zoom.js`
- `src/editor.js`
- `src/generator.js`
- `src/labels.js`
- `src/library-ui.js`
- `src/model.js`
- `src/objects.js`
- `src/performance-ui.js`
- `src/quality-ui.js`
- `src/render-config.js`
- `src/render-service.js`
- `src/render-worker.js`
- `src/renderer.js`
- `src/semantic-lod.js`
- `src/semantic-ui.js`
- `src/settlement-detail.js`
- `src/storage.js`
- `src/surface.js`
- `src/terrain-tiles.js`
- `src/ui.js`
- `src/viewport-renderer.js`
- `src/world-detail.js`
- `src/world-scene.js`
- `tests-deep-zoom.cjs`
- `tests-local-render.cjs`
- `tests-performance.cjs`
- `tests-semantic-render.cjs`
- `tests-semantic.cjs`
- `tests-world-render.cjs`
