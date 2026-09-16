# Work queue

## Current request — semantic deep zoom

- [x] Inspect the render path and run baseline tests; record SEMANTIC_ZOOM.md.
- [x] Add logical zoom plumbing and versioned deterministic detail primitives.
- [x] Implement terrain, mountain/forest, settlement/ruin and path hierarchies with source metrics.
- [x] Add visibility defaults, local invalidation and worker integration.
- [x] Add a streamed WebP tile-pyramid package with separate vectors.
- [x] Verify DPR identity, seams, 800% feature content, exports and stress; retain visual evidence.
- [x] Reconcile documentation and report remaining source-art/performance limits.

## Resume v0.5 acceptance

Continue from the current implementation. Detailed measured results and limitations live in `VALIDATION.md`.

- [x] Verify Ultra and responsive worker generation on the current implementation.
- [x] Recheck custom PNG import → pointer placement/transform edit → Save → Load → game JSON; verify 2K/4K/8K exports and custom image pixels.
- [x] Complete the five-minute 1920×1080 Medium-world workload with thousands of entities, timing distributions, chunk-cache and post-GC page-heap evidence.
- [x] Inspect 50/100/200/400% views and retain local evidence; split/whole comparisons pass at four LODs.
- [x] Run the combined expanded world-render suite, including the added export groups and 800%.
- [ ] Revisit hard/repeated mountain silhouettes and angular close-up rivers. Compare source artwork before changing rendering or commissioning replacements.
- [ ] Gather a longer post-GC heap series plus worker/process/GPU memory and pointer-to-present latency before asserting stable 60 FPS or leak freedom. The semantic workload has a separate isolated repeat; see VALIDATION.md.

## Recent completion

- 40 automated checks plus semantic rendering, local edits, complete overview pyramid and combined custom/PNG regression suites pass.
- Semantic detail, worker source-ratio warnings, visibility controls and streamed Deep Zoom export are implemented. v1/v2 compatibility and authoritative coordinates remain intact.
- Isolated five-minute workload: 3,745 entities, no errors, 191.96 MiB chunk cache within 192 MiB, seven completed brush transactions. Zoom p95 33.4 ms; 800% pan p95 16.8 ms. Performance/visual acceptance remains qualified; see `VALIDATION.md`.
- Commit status is recorded in Git history. Push is not part of the current request.
