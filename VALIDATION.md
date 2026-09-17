# v0.6 focused atlas validation

## Environment and scope — 2026-09-17

Windows, Node.js 24.17.0, bundled Playwright Chromium headless shell; server bound to 0.0.0.0:8085. The user superseded the former 800% goal with 50/100/150/200% and a cohesive illustrated atlas. No new runtime dependencies or source bitmap artwork were added. The original reference image is absent, so exact visual likeness is not verified.

## Automated acceptance

- npm test: 43 checks (24 model/editor, 2 worker lifecycle, 17 focused atlas). Covers deterministic generation, v1/v2, source budgets, bounded detail, unchanged world materials through the range, forest/mountain variation, path endpoint/in-place-edit behavior, dry-land access trails and both wheel/fit maximum clamps.
- npm run test:semantic-render: eight views at 50/100/150/200% and DPR 1/2; 12 whole/split comparisons across fixed mountain/settlement/coast crops; zero browser errors. Maximum fraction of channels differing by more than four: 0.000005208333 (0.0005208333%). All 495 tested feature IDs/positions match at physical resolutions 2/4/6. Camera reused all 52 existing cache keys in the tested same-LOD zoom segment, with zero new canvases or world revision changes.
- npm run test:world-render: complete suite passed. Native DPR/SVG, four working zooms, camera invariants, whole/split large rotated object, pointer brush/one Undo, all quality modes, responsive worker generation, custom PNG import/placement/transform/Save/Load/game JSON and decoded 2K/4K/8K PNG with custom marker pixels. Generation delivered seven progress stages while 25 UI frames continued.
- npm run test:local-render: POI move dirtied six near chunks, zero unrelated chunks; distant content unchanged, 460 main/worker feature entries match. Deliberately oversized art produces explicit source-limit metrics.
- npm run test:deep-zoom: complete overview-profile WebP package, padded 512px tiles, vectors and incomplete manifest on simulated disk failure pass. The optional default profile is now 200% × DPR 2. A full 7200px package was not exported during this QA iteration.

The combined browser suite ran after the rendering/feather fixes; focused semantic rendering was repeated after river-outline caching, hoisted material weights and the final clustered material-density mask. The subsequent manifest renderModel/cache-version metadata and v0.6 header text do not change rendered map content. The generated demo fixture is restored after npm test; visual/performance comparisons use the same legacy ElderMar geography.

## Visual evidence

Local ignored test-artifacts-v6/ contains overview.png, eldermar-{50,100,150,200}-dpr{1,2}.png, mountain-{100,150,200}.png, settlement-{100,150,200}.png and coast-{100,150,200}.png. atlas-results.json contains pixel/cache/identity metrics. regression/ contains world-render-checks.json, local-render-checks.json, deep-zoom-checks.json, custom save/load and decoded PNG artifacts. Screenshots are final editor views, not generated replacement illustrations.

Reviewed the 100% and 200% ElderMar views: feathered bases reduce hard horizontal mountain cutoffs, river turns are rounded, roads are continuous, forest groups have broader shape variation and POIs retain authored illustrations. Terrain is more layered with restrained relief. Source repetition, some broad soft relief patches and the finite bundled palette remain visible. These are qualified visual improvements; they do not establish an exact match to an unavailable reference.

Worst visible requested/native source ratios in the recorded atlas views were 0.835 at 200% DPR 1 and 1.284 at 200% DPR 2, below the explicit 1.35 fallback threshold. This does not certify every object/scale or Ultra. Custom/oversized art warnings remain.

## Comparable 60-second workloads

Both baseline (previous commit, camera constrained to the new range by the test) and focused v0.6 run used the same ElderMar, 1920×1080 CSS, DPR 1, 2,300 added rocks and the same pan/zoom/brush/200% sequence. No other browser suite ran concurrently. The focused run preceded the final source-base feather and gentler relief adjustment; the separate final 300-second run checks those changes.

| Measurement | Baseline | v0.6 focused |
| --- | --- | --- |
| Pan frame p95 | 16.7 ms | 16.7 ms |
| Zoom frame p95 | 33.4 ms | 33.4 ms |
| 200% pan maximum | 266.7 ms | 50.0 ms |
| Brush CPU p95 | 0.5 ms | 0.7 ms |
| Final cache | 201,289,536 bytes | 48,991,104 bytes |
| Cache budget | 192 MiB | 128 MiB |

Cache consumption and worst observed stall improved; not every timing improved. Brush CPU rose by 0.2 ms in this short comparison. Main-page heap deltas were about 0.76 MB in both runs. Raw files: baseline/performance.json and focused/performance.json. Frame intervals are not pointer-to-present latency, and two post-GC samples cannot prove leak freedom. Worker/process/GPU memory is not measured. Source feathers add a small bounded worker-side asset allocation outside the screen cache.

## New-world generation

The worker-based test:atlas-generation suite passed: seven progress stages, three additional dry-land access trails and no page errors. generated/world.json plus generated/overview.png and generated/world-{100,200}.png capture the fresh v0.6 ElderMar. Those generation captures precede the final minor material-density reduction; authoritative generated data is unchanged by that render-only adjustment.

The initial 300-second v0.6 run (stress-final/performance.json) passed cache/error assertions but had pan/zoom/200% p95 of 33.4/50/33.4 ms. This prompted two worker optimizations (cached river outlines and hoisted per-render material weights) and clustered sparser micro-marks. The final repeat is recorded separately below; the earlier slower run is retained rather than hidden.

## Final optimized five-minute workload

The final 300-second repeat completed with 2,453 objects / 4,275 indexed scene entities, eight closed brush transactions and zero browser errors. No other browser suite ran concurrently. It includes cached river outlines, hoisted material weights and spatially clustered micro-marks.

| Measurement | Median | p95 | Maximum |
| --- | --- | --- | --- |
| Pan frame interval | 16.7 ms | 33.4 ms | 50.1 ms |
| Zoom frame interval | 16.7 ms | 50.0 ms | 83.4 ms |
| 200% pan frame interval | 16.7 ms | 33.4 ms | 100.1 ms |
| Brush update CPU | 0.6 ms | 0.9 ms | 14.8 ms |

Final chunk cache: 51,121,152 bytes (48.75 MiB), below 134,217,728 bytes (128 MiB). Material patches remain at/below 256. Main-page post-GC heap: 12,684,012 → 13,806,024 bytes (+1,122,012), including retained editing history/caches. Raw report and screenshot: stress-optimized/performance.json and stress-optimized/soak.png.

The optimized run reduced brush p95/max and final sampled render CPU versus the initial v0.6 run; frame-interval p95 did not improve. Lower cache use and same-LOD reuse are demonstrated. A blanket FPS improvement over v0.5 and stable 60 FPS are **not established**, particularly across different days/host load. This performance acceptance remains qualified rather than marked fully achieved.

Final maintenance: 119 inventory entries/anchors, 60 JavaScript syntax checks, 124 local Markdown links and git diff --check passed. Server binding verified as 0.0.0.0:8085. AGENTS.md was reviewed and needed no workflow change.
