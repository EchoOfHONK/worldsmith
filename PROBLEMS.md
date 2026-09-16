# Problems and regression prevention

Statuses: **Open** = unresolved; **Implemented / verify** = code exists, acceptance incomplete; **Verified fix** = focused evidence exists; **Limitation** = known constraint. Preserve IDs when updating. Source for user reports: the shared Worldsmith conversation linked in the original continuation request, especially the render-quality request and PATCH v0.5.

## User-reported problems

| ID | Problem and status | Prevention / where to inspect | Required evidence |
| --- | --- | --- | --- |
| P01 | Blurry terrain, objects and text at 100%+ — **Implemented / verify** | `viewport-renderer.js`, `terrain-tiles.js`, `asset-lod.js`; retain DPR, native redraw, original asset sources and separate SVG labels. | Native-DPR checks and visual inspection at 50/100/200/400%; compare artwork with source detail. |
| P02 | Lagging zoom/pan even on powerful devices — **Implemented / verify** | `Editor.transform`, `ViewportRenderer.camera/render`, `RenderService`; camera must reuse chunks rather than invalidate world data. | 1920×1080 Medium world with thousands of entities; measured frame intervals and freezes. 60 FPS is a target, not a verified fact. |
| P03 | Brush strokes become slow — **Implemented / verify** | `queuePaint`, `flushPaint`, `brushes.paint`, invalidation wrapper in `terrain-tiles.js`; coalesce samples, interpolate and update dirty regions. | Real pointer stroke follows cursor; measure update latency and confirm one undo transaction. |
| P04 | Rectangular seams and clipped mountains/trees/objects at zoom or chunk boundaries — **Implemented / verify** | `world-scene.js`, `viewport-renderer.js`, `renderer.js`; global placement, rotation/anchor-aware bounds and bleed. | Whole-versus-split render plus visual inspection of large rotated objects, forests and coasts across boundaries at four zoom levels. |
| P05 | Terrain patterns jump or procedural regions break apart — **Implemented / verify** | `random.js`, `generator.js`, `surface.js`, `terrain-tiles.js`, `world-scene.js`; use seed + world coordinates, never tile-local independent worlds. | Same-seed determinism; compare patterns while panning/zooming and across adjacent chunks. |
| P06 | Water/coasts look flat, geometric or artificial — **Implemented / verify** | `coast.js`, `terrain-tiles.js`, `renderer.js`; shore distance/depth variation, continuous contours, restrained flow lines and estuaries. | Visual review at overview and close zoom; verify river outlets and no new coast seams. |
| P07 | High quality costs too much performance — **Open acceptance** | `render-config.js`, worker/caches/culling; do not globally reduce resolution or asset quality to hide cost. | Five-minute workload, timing distributions, bounded caches and post-GC/process memory evidence. Cache bounds alone are insufficient. |
| P08 | Too few/soft/repetitive objects; need richer surface and custom artwork — **Implemented / verify** | `catalog.js`, `assets/`, `library-ui.js`, `custom-assets.js`; coherent art and honest source resolution; retain PNG/WebP portability. | Catalog/metadata tests and current import → edit → Save/Load → export round trip. Avoid claiming 104 unique drawings. |

## Observed defects and environment limitations

| ID | Finding and status | Prevention / evidence |
| --- | --- | --- |
| D01 | Empty brush strokes discarded redo history — **Verified fix** | `beginStroke/endStroke` commit history only when cells change. Covered in `tests.cjs`. |
| D02 | Renderer readiness could describe an old camera state — **Verified fix (focused)** | `waitReady` and browser settle predicates check pending render, camera zoom and world revision. Current-camera checks passed; preserve them. |
| D03 | Render-worker failure/disposal could leave jobs waiting — **Verified fix** | Reject failed active/queued/future requests and settle disposal jobs. Two `tests-render-service.cjs` checks pass. |
| D04 | Soak test omitted the final brush transaction — **Verified fix** | Ensure every synthetic stroke ends before reporting undo/memory. Corrected 300-second run completed with ten undo entries, including the final stroke; see VALIDATION.md. |
| E01 | Standalone Playwright browser launch blocked in earlier sandbox — **Historical environment limitation** | Use an available authorized browser or browser acceptance page. Report unavailable measurements; do not weaken app security or claim tests passed. |
| L01 | Old small raster sources lose detail when enlarged — **Limitation** | Show source resolution, select suitable masters/LOD, recommend larger custom sources. Rendering cannot recover missing pixels. |
| L02 | Manual terrain edits leave previously generated rivers/roads in place — **Limitation** | Explain existing behavior; regeneration or manual path editing is required. A future recomputation feature needs explicit scope and tests. |

| D05 | PNG export fails because a worker helper shadows self.fonts — **Verified fix** | Rename fonts helper to loadFonts; new real-browser import and 2K/4K/8K export checks cover this path. |
| D06 | Documented inventory generator missing from Git — **Verified fix** | Restored scripts/update-contents.cjs; generation and --check verify all 107 Git-visible files and entry anchors. |

## Semantic zoom follow-up (2026-09-15)

| ID | Finding and status | Prevention / evidence |
| --- | --- | --- |
| P09 | Deep zoom enlarged macro collage without new local information — **Verified implementation; art limits remain** | Shared semantic bands, parent children, world-lattice materials and structured-path detail. `tests-semantic-render.cjs` measures feature IDs/counts and gradient energy, checks five scene classes across four zooms and captures DPR 1/2. See L03 and visual qualifications in VALIDATION.md. |
| D07 | Generated road endpoints shared mutable POI positions, causing main/worker divergence on object edits — **Verified fix** | Copy endpoints in generator route output. Model alias regression and `test:local-render` confirm independent geometry and matching post-move child identities. |
| D08 | Cached semantic variants were repeatedly overdrawn during continuous zoom — **Verified fix** | Deduplicate fallback images by physical tile in viewport-renderer. Isolated 300-second repeat: zoom p95 33.4 ms, versus 166.7 ms before the fix; cache remains bounded. |
| L03 | Some special props, large masters and custom images still exceed source detail — **Explicit limitation** | Worker records requested/native ratio and fallback IDs; UI and package manifest disclose limits. Test deliberately oversized statue to verify warning. More faithful artwork or a type-specific decomposition is required for those types. |
| L04 | Full recommended deep-zoom package can be large and slow — **Explicit limitation** | Sequential worker tiles, progress/cancel, `complete:false` on interruption, exact coverage and source-limit metadata. No giant intermediate canvas. Current exporter rebuilds requested tiles; it does not yet reuse an existing package incrementally. |
