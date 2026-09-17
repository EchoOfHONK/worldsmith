# Work queue

## v0.6 — focused atlas at 50–200%

- [x] Cap wheel/buttons/fit at 200%; reuse stable atlas chunks across zoom.
- [x] Enrich ground, forest masses, ridge grouping, smooth water/roads and POI footing using bundled art.
- [x] Refine generated forest clearings and landmark access without regenerating saved worlds.
- [x] Verify four working zooms at DPR 1/2, seams, cache identity, editing, PNG exports and new generation; retain screenshots.
- [x] Complete final isolated performance repeat and reconcile measured limits. Commit status is recorded in Git history.

## Qualified acceptance / future evidence

- The original first reference is absent from the repository. Exact artistic comparison requires that image; current changes follow the written direction. Source repetition remains a bundled-art limitation.
- Blanket FPS improvement and stable 60 FPS remain unconfirmed; final pan/zoom p95 was 33.4/50 ms despite lower cache use. See VALIDATION.md.
- Longer post-GC series, worker/process/GPU memory and pointer-to-present latency remain unmeasured. Do not assert leak freedom or stable 60 FPS from image-cache bounds.

## Recent completion

- 43 automated checks pass; focused atlas, local-edit, full PNG/custom-asset regression, optional tile export and fresh-generation suites pass.
- Earlier 800% work supplied the deterministic detail/worker foundation; that product target is superseded by v0.6. Macro decomposition is dormant; the optional tile profile now stops at logical 2×.
- Screen cache budget is 128 MiB, down from 192. Timings and limitations are in VALIDATION.md; do not treat every performance metric as improved.
- Commit status lives in Git history. Push is not part of this request.
