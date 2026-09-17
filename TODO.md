# Work queue

## v0.7 — continuous world composition

- [x] Read the supplied reference and current generation/render path; baseline: 43 checks pass.
- [x] Introduce a seeded global composition before terrain: connected ridges, valleys, broad character regions and open spaces.
- [x] Derive drainage, coherent forest/swamp masks and terrain from that composition; place focal landmarks before connecting routes and local detail.
- [x] Verify chunk-independent identities, painter order and arbitrary split rendering; preserve brush-local updates and the 200% limit.
- [x] Inspect fresh ElderMar overview and fixed 100/150/200% crops against the supplied reference; run regression and isolated performance checks.
- [x] Prepare verified changes, format/architecture records, inventory and validation evidence for commit. Commit status lives in Git history.

## v0.6 — focused atlas at 50–200%

- [x] Cap wheel/buttons/fit at 200%; reuse stable atlas chunks across zoom.
- [x] Enrich ground, forest masses, ridge grouping, smooth water/roads and POI footing using bundled art.
- [x] Refine generated forest clearings and landmark access without regenerating saved worlds.
- [x] Verify four working zooms at DPR 1/2, seams, cache identity, editing, PNG exports and new generation; retain screenshots.
- [x] Complete final isolated performance repeat and reconcile measured limits. Commit status is recorded in Git history.

## Qualified acceptance / future evidence

- The reference was supplied on 2026-09-17 for v0.7. Compare new generation against it; source repetition remains a bundled-art limitation.
- Blanket FPS improvement and stable 60 FPS remain unconfirmed; final v0.7 pan/zoom p95 was 16.8/33.4 ms on this host. See VALIDATION.md.
- Longer post-GC series, worker/process/GPU memory and pointer-to-present latency remain unmeasured. Do not assert leak freedom or stable 60 FPS from image-cache bounds.

## Recent completion

- 57 automated checks pass; focused atlas, continuity, local-edit, full PNG/custom-asset regression, optional tile export and fresh-generation suites pass. Final isolated 300-second stress run passed without errors.
- Earlier 800% work supplied the deterministic detail/worker foundation; that product target is superseded by v0.6. Macro decomposition is dormant; the optional tile profile now stops at logical 2×.
- Screen cache budget is 128 MiB, down from 192. Timings and limitations are in VALIDATION.md; do not treat every performance metric as improved.
- Commit status lives in Git history. Push is not part of this request.
