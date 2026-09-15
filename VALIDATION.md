# v0.5 validation status

## Current Windows acceptance — 2026-09-15

Node.js 24.17.0, bundled Playwright Chromium headless shell, local HTTP server on port 4174 (4173 was occupied). Standalone browser launch works in this environment. The server remains bound to `0.0.0.0`.

- `npm test`: 24 model/editor and 2 worker-lifecycle checks pass after the export fix. The generated demo differed only in floating-point temperature values; the committed fixture was preserved.
- Original `npm run test:world-render`: all six check groups pass at 1920×1080 CSS, DPR 2. Native backing/SVG labels at 50/100/200/400%, unchanged camera world revision, no camera-created main-thread canvases, real pointer brush and exact single-transaction undo, all quality modes and debug overlay pass. Worker generation delivered seven progress messages while 53 UI frames continued.
- Whole/split comparison at LOD .5/1/2/4: no channels differ by more than three; maximum difference is two. This verifies the tested rectangle with a large rotated castle, terrain and forest boundaries.
- Reviewed all four zoom PNGs. No rectangular terrain seam was evident in those views; labels remain sharp. Hard mountain bases, repeated mountain silhouettes and angular close-up river segments remain visible. These are not a complete visual-quality signoff.
- New browser coverage imports a 256×256 PNG through the form, places it by pointer, edits scale/rotation, downloads Save, clears browser artwork caches, loads the saved file and compares embedded assets/objects in game JSON. This passed and exposed the export worker's `fonts` global collision. Renaming the helper to `loadFonts` restores access to `self.fonts`.

## Five-minute workload

`npm run test:performance` completed 300 seconds at 1920×1080 CSS, DPR 1, Medium 1800×1200 world, 2,453 objects / 3,745 scene entities. Ten brush transactions were committed, including the final stroke; no page/console errors occurred.

| Measurement | Median | p95 | Maximum |
| --- | --- | --- | --- |
| Pan frame interval | 16.7 ms | 33.4 ms | 66.7 ms |
| Zoom frame interval | 16.7 ms | 33.5 ms | 100.1 ms |
| Brush update CPU sample | 0.6 ms | 1.1 ms | 11.9 ms |

Final chunk cache: 79,876,800 bytes (76.18 MiB), below 201,326,592 bytes (192 MiB). Main-page post-GC heap: 10,055,876 → 11,283,956 bytes (+1,228,080). This includes retained editing history and caches; two heap samples cannot establish a leak trend. Worker heap, process RAM and GPU memory were not measured. Brush CPU samples do not measure pointer-to-present latency.

The rendering suite overlapped this workload and other host applications were active. Treat timings as measurements under that load, not an isolated benchmark or stable-60-FPS certification. A quiet-host repeat and longer memory series remain useful acceptance work.

A separate 25-second workload against the final test code passed the explicit closed-stroke assertion, recorded one undo entry and no errors. This is focused regression evidence, not another five-minute benchmark.

## Evidence and remaining work

Local ignored `test-artifacts-v5/` holds `world-render-checks.json`, `seams.json`, four `working-*.png` views, `performance.json`, `soak.png`, and custom round-trip/export artifacts. Large screenshots and generated saved worlds are intentionally not committed. The six original render groups ran before the narrowly scoped font-helper rename; the new export checks run separately against the fix. A complete combined-suite rerun has not yet been recorded. PNG 2K/4K decoded at 2048×1365 and 4096×2731; independent downsampled pixel checks found 464/466 magenta custom-marker pixels. The first 8K attempt exceeded the test-only 180-second download deadline; the deadline was removed for the retry.

Do not call this release leak-free or visually complete. Remaining acceptance work is tracked in `TODO.md` and `PROBLEMS.md`.

The 8K retry passed: 8192×5461 PNG decoded successfully and the browser pixel probe confirmed the imported magenta marker. The strengthened reload check first clears the current object list, so it waits for objects to return from the saved file. All three export sizes now have focused post-fix browser evidence.

Final maintenance checks: 107 inventory entries/anchors and 107 local Markdown links validate; JavaScript syntax checks and git diff --check pass.
