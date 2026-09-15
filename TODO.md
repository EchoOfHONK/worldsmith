# Work queue

## Current request — rolling repository guidance (2026-09-15)

- [x] Add AGENTS, TODO, MEMORY, PROBLEMS and a complete navigable CONTENTS.
- [x] Verify the complete inventory, entry-point anchors and documentation.

Commit/push status is recorded in Git history rather than duplicated as commit hashes here.

## Resume v0.5 acceptance

The previous implementation task was interrupted for GitHub setup. Continue from the current code, not from a fresh rewrite. See `VALIDATION.md` for confirmed evidence.

- [ ] Complete and record Ultra, responsive worker generation, and PNG 2K/4K/8K browser checks on the current revision.
- [ ] Recheck custom import → placement/edit → Save → Load → PNG/JSON after the worker changes.
- [ ] Run the full five-minute Medium-world stress test at 1920×1080 with thousands of entities; record pan/zoom timing, brush latency, cache and post-GC heap evidence. If measurement is unavailable, state that limitation.
- [ ] Inspect 50/100/200/400% views for terrain/coast seams, clipped sprites and sharp labels; retain evidence and fix any reproducible failures.
- [ ] Reconcile v0.5 acceptance results in VALIDATION/README and review remaining user-reported issues before calling the patch complete.

## Recent completion

- Private `EchoOfHONK/worldsmith` repository created; initial v0.5 source, artwork, examples and tests pushed to `main`.
- Empty-stroke redo preservation, current-camera readiness and render-worker job settlement implemented; 24 model/editor and 2 worker lifecycle checks passed.
