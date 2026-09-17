# v0.7 world continuity validation

## Environment and scope — 2026-09-17

Windows, Node.js 24.17.0, bundled Playwright Chromium headless shell; server verified listening on **0.0.0.0:8085**. The supplied reference informs the composition. Maximum logical zoom stays 200%; no runtime dependencies or new source artwork were introduced. Existing saved worlds keep their data; the bundled demo is intentionally regenerated with the new world-layout algorithm.

## Automated checks

- Final repository checks: inventory/entry anchors for 123 files, syntax for 63 JavaScript files, 133 local Markdown links and `git diff --check` pass.
- `npm test`: **57 checks** — 24 model/editor, 2 worker lifecycle, 17 focused atlas and 14 new continuity checks. Covers all ten presets, deterministic global composition, connected masses, contrasting forest/glade density, focal habitats and routes, downhill rivers, coherent lake basins, actual bridge intersections, dry smoothed paths, arbitrary sprite partitions, distant edits, old v1/v2 saves, source-cell contamination and full-footprint decoration clearance.
- `npm run test:world-render`: ten browser checks pass, including 50/100/150/200% at DPR2, SVG labels, zero camera canvas allocations/world revisions, rotated large-object split rendering, pointer brush/one Undo, quality presets, worker generation, custom PNG import/transform/Save/Load/game JSON and decoded **2K/4K/8K PNG** with embedded marker pixels. Generation delivered ten progress messages while 44 UI frames continued. The tested rotated-object crop had no channels differing by more than three at any tested resolution.
- `npm run test:semantic-render`: eight editor captures at four zooms and DPR1/2; twelve split comparisons with no channels differing by more than four. All **495** tested feature IDs/positions match at physical resolutions 2/4/6. Same-LOD camera movement created no Canvas, changed no world revision and added no cache keys.
- `npm run test:continuity-render`: **20 comparisons**, five habitats × four zooms, each split into six unequal rectangles. All feature identity unions match. Maximum fraction of channels differing by more than four: **0.00001721763** (0.001721763%). Native-size atlas preparation removes 1,894 / 1,553 / 540 / 486 foreign pixels from tree crops 24–27; a synthetic check preserves the main silhouette.
- `npm run test:local-render`: moving one POI dirtied **8 nearby chunks, zero unrelated chunks**; distant content stayed identical and **175** main/worker feature entries matched. Deliberately oversized art still produces explicit source-limit warnings.
- `npm run test:deep-zoom`: complete **17-tile overview profile** at logical 1× / DPR1, 512px WebP tiles, structured vectors, atlas-v7 metadata and incomplete manifest on simulated disk failure pass. Default 2× / DPR2 dimensions (7200×4800) remain model-tested; a full default-profile package was not emitted in this run.
- `npm run test:atlas-generation`: fresh ElderMar worker generation, ten progress stages, five access trails, portable world JSON and editor screenshots pass.

After visual QA found decoration overlapping a castle, generation adopted the renderer's shared object bounds. Model, focused-render, continuity, local-edit, tile-package and fresh-generation suites were repeated after this final safeguard. The earlier full PNG/custom-asset suite tests unchanged export code; final demo PNGs were separately regenerated through the same worker.

## Visual evidence and source limits

- `demo-clean.png`, `demo-atlas.png`: final 1800×1200 canonical exports, without and with labels/frame.
- `test-artifacts-v7/eldermar-{50,100,150,200}-dpr{1,2}.png`: actual editor views; `atlas-results.json` records camera/quality results.
- `test-artifacts-v7/continuity/eldermar-world.png` and `{forest,frontier,swamp,borderland,shore}-{100,150,200}.png`: label-free worker renders of fixed world crops; these crop captures use DPR2. `checks.json` records rectangles, source ratios and six-way comparisons.
- `test-artifacts-v7/generated/world.json`, `overview.png`, `world-100.png`, `world-200.png`: fresh generator outputs.
- `test-artifacts-v7/regression/`: custom-project round trip, decoded 2K/4K/8K PNGs and full browser regression report.
- `test-artifacts-v7/deep-zoom-full-overview/`: real WebP package, project JSON, manifest and vector files.

Reviewed overview, forest and frontier close-ups against the supplied reference. The world now reads as a central woodland, northern ridge, river/lake corridor, ruined frontier and open southern valley. Detached white strips above forest trees are gone; waterfall/rock decoration no longer covers the castle. Broad soft terrain shading, repeated bundled silhouettes and limited unique landmark artwork remain visible. This is not an exact reproduction of the painting.

Worst requested/native source ratio in the final tested working-range views/crops is **1.3355**, below the explicit 1.35 fallback threshold. That permits a bounded enlargement and is **not a claim of native 200% for all assets**. Ultra, large manual scales and custom images can still exceed their native source detail and retain warnings.

## Performance

Final isolated `npm run test:performance` **300-second** repeat passed after the decoration-placement safeguard: **zero errors**, pan/zoom/200%-pan p95 **16.8/33.4/33.3 ms**, brush-update p95 **0.7 ms** (maximum 12.3 ms), render CPU p95 0.7 ms. The screen cache reached **48.75 MiB**, with 2,458 objects including stress additions, 3,813 scene entities and eight Undo entries. Material patches remained within their 256 limit. Post-GC main-thread heap was 12,649,948 bytes before and 13,874,280 after, including retained Undo history. Report: `test-artifacts-v7/performance-final/performance.json`. The earlier isolated repeat is retained under `test-artifacts-v7/performance/`.

The screen cache budget stays **128 MiB**, material patches 256 and worker terrain tiles 32. Native prepared atlas crops on the main thread are a separate finite cache, at most about 8.5 MiB for the 23 eligible cells, exposed as `assets.lodStats().preparedBytes`. They are not allocated by camera movement.

Timings are host-dependent. Brush CPU time is not pointer-to-present latency. Main-thread post-GC heap samples do not measure worker/process/GPU memory or prove leak freedom. Stable 60 FPS and a blanket speedup over v0.6 are not asserted, especially because the generated geography changed.

## Changed files

- Generation/rendering: `src/world-layout.js` (new), `src/generator.js`, `src/generator-worker.js`, `src/world-scene.js`, `src/objects.js`, `src/atlas-style.js`, `src/asset-lod.js`, `src/coast.js`, `src/renderer.js`, `src/render-worker.js`, `src/viewport-renderer.js`, `src/labels.js`, `src/storage.js`, `src/deep-zoom.js`.
- Entry points/tests: `index.html`, `package.json`, `tests.cjs`, `tests-semantic.cjs`, `tests-continuity.cjs` (new), `tests-continuity-render.cjs` (new), `scripts/update-contents.cjs`.
- Demo: `demo.world.json`, `demo-clean.png`, `demo-atlas.png`.
- Records: `WORLD_LAYOUT.md` (new), `DATA_FORMAT.md`, `ASSETS.md`, `SEMANTIC_ZOOM.md`, `README.md`, `MEMORY.md`, `PROBLEMS.md`, `TODO.md`, `CONTENTS.md`, `VALIDATION.md`. AGENTS.md was reviewed and remains unchanged.

Architecture and compatibility decisions: [WORLD_LAYOUT.md](WORLD_LAYOUT.md), [DATA_FORMAT.md](DATA_FORMAT.md). Artifact directories are local and Git-ignored; canonical demo exports are committed.
