# Work queue

## Current request — continue v0.5 and commit (2026-09-15)

- [x] Read repository guidance and run current model/render/performance acceptance.
- [x] Fix PNG export's worker font-name collision and restore the missing inventory generator.
- [x] Finish 8K export verification and reconcile records; commit this coherent acceptance/fix change.

## Resume v0.5 acceptance

Continue from the current implementation. Detailed measured results and limitations live in `VALIDATION.md`.

- [x] Verify Ultra and responsive worker generation on the current implementation.
- [x] Recheck custom PNG import → pointer placement/transform edit → Save → Load → game JSON; verify 2K/4K/8K exports and custom image pixels.
- [x] Complete the five-minute 1920×1080 Medium-world workload with thousands of entities, timing distributions, chunk-cache and post-GC page-heap evidence.
- [x] Inspect 50/100/200/400% views and retain local evidence; split/whole comparisons pass at four LODs.
- [ ] Run the combined expanded world-render suite on a quiet host; the original groups and added export groups have been exercised separately.
- [ ] Revisit hard/repeated mountain silhouettes and angular close-up rivers. Compare source artwork before changing rendering or commissioning replacements.
- [ ] Repeat performance measurements without concurrent rendering/export tests; gather a longer post-GC heap series plus worker/process/GPU memory and pointer-to-present latency before asserting stable 60 FPS or leak freedom.

## Recent completion

- Model/editor checks: 24 pass; worker-lifecycle checks: 2 pass.
- Native DPR, camera reuse, split-render boundaries, pointer-stroke undo, all quality modes and responsive generation pass.
- Five-minute workload: 3,745 entities, no errors, 76.18 MiB chunk cache, ten completed brush transactions. Performance/visual acceptance remains qualified; see `VALIDATION.md`.
- Commit status is recorded in Git history. Push is not part of the current request.
