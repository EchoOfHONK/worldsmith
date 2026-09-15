# v0.5 validation status

2026-09-15: 24 model/editor tests and 2 render-service lifecycle tests pass (`npm test`).

In-app Chromium at DPR 2 passed native rendering at 50/100/200/400%, camera revision preservation, whole-versus-split chunk comparisons at four LODs, brush mutation with exact Undo, and Performance/Balanced quality checks. The remaining browser/export checks and the five-minute soak have not yet been confirmed after the interrupted session.

Standalone Playwright could not launch Chrome in the sandbox. The browser acceptance page provides an alternative; it does not measure total RAM. Earlier performance files in the parent x20/work folder are prior-run evidence, not current acceptance results.

Do not interpret this build as a verified stable-60-FPS or leak-free release. Complete the remaining checks before making those claims.
