# Semantic deep-zoom validation

## Environment and scope — 2026-09-16

Windows, Node.js 24.17.0, bundled Playwright Chromium headless shell. App served on `0.0.0.0:8085`; browser tests use `http://127.0.0.1:8085`. No runtime dependencies added. The legacy demo fixture is preserved; `npm test` regenerates it temporarily.

## Automated acceptance

- `npm test`: 40 checks (24 model/editor, 2 worker lifecycle, 14 semantic). Covers v1/v2/defaults, source budgets, deterministic children, bounded material patches, local invalidation, visibility, pyramid coverage and separate vectors. A new road-endpoint alias regression protects object edits from moving authoritative roads.
- `npm run test:world-render`: complete combined suite passed, including 50/100/200/400/800% DPR 2, camera canvas/revision invariants, split rendering, pointer brush/undo, all quality profiles, responsive worker generation, custom PNG import → placement → transform → Save/Load → game JSON and decoded 2K/4K/8K PNG exports.
- `npm run test:semantic-render`: DPR 1/2 captures at 100/200/400/800%; five crop classes (mountain, dead forest, settlement, road, coast) compared whole versus split at four semantic zooms. Each requires fewer than 0.3% channels differing by more than four. Feature identities at resolution 8/16/24 must match at logical zoom 8. A fixed crop compares inspection gradient energy and feature counts against an enlarged overview baseline. Camera and local brush invariants are also checked.
- `npm run test:local-render`: local old/new POI invalidation, distant detail preservation, main/worker child identity after movement and explicit oversized-source fallback warning passed.
- `npm run test:deep-zoom`: complete canonical overview-profile package, 512×512 WebP tiles, separate vectors, semantic differences at equal raster dimensions, and incomplete manifest after simulated disk failure passed.

The expanded world-render suite ran before the final forest-mask tightening, road-endpoint copy and fallback-cache deduplication. Focused semantic/local suites exercise those changes. Final semantic measurements and stress results are below.

## Evidence

Local ignored `test-artifacts-semantic/` contains:

- `eldermar-overview.png`, `eldermar-{100,200,400,800}-dpr{1,2}.png`.
- `mountain-{100,400,800}.png` and `settlement-{100,400,800}.png`, fixed world centers.
- `semantic-results.json`, `local-render-checks.json`, `deep-zoom-checks.json`.
- `regression/`: combined existing world-render checks and PNG/custom-asset export evidence.
- `deep-zoom/`: recommended DPR 2 / 800% **partial** canonical crop package, 24 tiles across all levels, declared full top extent 28,800×19,200. It is not a full-world top-resolution export.
- `deep-zoom-full-overview/`: **complete** canonical package for maxZoom 1 / DPR 1. This verifies full coordinate coverage and padded edge WebP output with a smaller profile.
- `stress-final/`: final isolated five-minute workload and screenshot.

Full-world recommended export is implemented but its thousands of tiles were not all written in this QA run. Export remains sequential, potentially slow and large; cancellation/failure leaves `complete:false`. Incremental coordinate calculation is tested; automatic reuse of an existing package is not implemented.

## Performance and finite-source limits

Screen cache budget remains 192 MiB. Worker terrain cache remains 32 tiles; new material cache is capped at 256 patches. Derived children are not accumulated or saved as POIs.

The first semantic 300-second workload exposed repeated overdraw of cached semantic variants during zoom (p95 frame interval 166.7 ms). The compositor now uses one newest fallback per physical tile. The focused 40-second repeat reduced zoom p95 to 49.9 ms; 800% pan p95 was 16.8 ms. These are host measurements, not a stable-60-FPS claim.

The benchmark measures frame intervals, brush CPU samples, bounded image/material caches and two post-GC main-page heap samples. It does not measure worker/process/GPU memory or pointer-to-present latency. Retained editing history contributes to heap growth; two samples cannot prove leak freedom.

At 100% macro composition remains; around 400% smaller trees/peaks/buildings blend in with material/path detail; at 800% supported macro types resolve into smaller bundled elements and additional world-space primitives. Source ratio warnings remain for unsupported props, oversized masters/custom art and fading macros during transition. Repeated small source silhouettes and the original angular river geometry remain visible; this is additional illustrated map information, not unlimited native source artwork. New art would still improve these limitations.

## Final isolated 300-second measurement

1920×1080 CSS, DPR 1, Medium 1800×1200 world; 2,453 objects / 3,745 indexed scene entities, seven completed brush transactions, zero browser errors. No other browser acceptance/export suite ran concurrently.

| Measurement | Median | p95 | Maximum |
| --- | --- | --- | --- |
| Pan frame interval | 16.7 ms | 16.7 ms | 50.0 ms |
| Continuous zoom frame interval | 16.7 ms | 33.4 ms | 66.7 ms |
| 800% pan frame interval | 16.7 ms | 16.8 ms | 50.1 ms |
| Brush update CPU sample | 0.4 ms | 0.7 ms | 10.9 ms |

Final chunk cache 201,289,536 / 201,326,592 bytes (191.96 / 192 MiB); sampled worker material patches peaked at 143 / 256. Post-GC main-page heap 12,685,256 → 13,841,016 bytes (+1,155,760). Cache use is higher than the earlier pre-semantic workload, within the unchanged budget. Timings do not show the initial semantic overdraw regression after the fix; comparisons with historical runs remain qualified by different camera workloads and host load. Raw evidence: `test-artifacts-semantic/stress-final/performance.json`.

## Final semantic measurement and visual review

Final semantic browser rerun passed after all render fixes. The fixed mountain crop had 11 overview macros versus 88 inspection children and 449 material primitives. Gradient energy was 0.7799 for the enlarged overview baseline versus 7.1768 for inspection (9.20×). All 535 tested feature IDs/positions matched at physical resolutions 8/16/24. Across 20 whole/split comparisons, the worst fraction of channels differing by more than four was 0.0000055631 (0.000556%).

The tested 800% viewport's worst requested/native source ratio was 0.308 at DPR 1 and 0.616 at DPR 2, with zero source-limited fallbacks in that viewport. This does not certify every asset or user scale. Chunk draw counts differ with raster chunk partitions; unique feature identity is verified separately. Local brush invalidation covered 7,225 world-square units with no far-away dirty chunks; the POI move test covered 26,080 with 32 near chunks dirty, zero wrong dirty chunks and matching 543 main/worker feature entries.

Reviewed the final mountain and settlement 800% screenshots: individual peaks/trees/buildings and ground/path/water primitives are visible; the settlement view includes normal/dead forest, road, river, bridge and shoreline. Source repetition and angular river segments remain apparent. Overview and both fixed 100/400/800% crop series are retained for comparison. The complete overview export and local-edit/source-warning suites also passed on the final code.

Final maintenance: 117 inventory entries/anchors, 58 JavaScript syntax checks, 122 local Markdown links and `git diff --check` pass. Server binding verified as `0.0.0.0:8085`.
