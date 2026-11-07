# QA report — 2026-11-07
## Executed
- Intel macOS 26.7.2, Node 26.13.0, official IWSDK 1.1.0-rc.2 / IWER 2.7.0 / managed Chromium.
- TypeScript strict typecheck passed after fixing ES2020 replaceAll and launchXR return assumptions.
- `npm test`: 13 tests passed: mask fill/empty/tiny/crossing/clipping/noisy determinism, intersection/bounds/removal, real surface traversal, missing X Level 2 and three extensions, direct success when already sufficient, side adaptation, clearance/thin/disconnected/elevation rejection, bounded search, authorship, stale revision predicate.
- SDK-managed browser actual mouse QA: Level 1 success; Level 2 real DISCONNECTED_SPAN → human redraw → replan → success; clear/empty guidance, Undo, pause/resume, tiny invalid stroke, reset. No page errors. Evidence: evidence/desktop-qa.json and submission/screenshots/02–04.
- SDK creature asset preview: 512 triangles, three meshes, no diagnostic warnings. Isolated preview is labeled as a model, not gameplay.
- Production builds succeeded, with SDK chunk-size and upstream zod annotation warnings. First HTTP harness request failed against HTTPS preview; corrected scheme. Software-rendered production run reached Level 2 but exceeded 60s; increased timeout and reduced viewport. Final production regression passed on Chromium Metal.

## Failures found / handled
- Shared preview rejects SDK local self-signed HTTPS (`ERR_CERT_AUTHORITY_INVALID`): use official managed Chromium.
- Editor mode leaves runtime iframe at 0×0: select Runtime before browser input.
- Repeated development reloads exhausted WebGL contexts: added explicit World.destroy hot-module teardown and restarted managed browser.
- Immersive IWER overlay intercepts DOM clicks: exit XR before desktop tests; use spatial controls inside XR.
- Browser screenshot of zero-height fixed-layout body timed out: capture page/runtime surface instead.
- Stale worker could arrive while a new stroke was in progress: invalidate revision on pointer down, before release.

## Pending verification
- Active IWER Quest 3 hand input passed Level 1. Level 2 spatial control selection, short-span pinch drawing, genuine DISCONNECTED_SPAN, human extension, replanning and crossing passed. Evidence: evidence/xr-hand-qa.json, xr-hand-result.json, xr-level2-qa.json and screenshots/05–06. Both levels were rerun successfully after the conservative footprint expansion.
- Final production static build browser regression passed (47.8s gameplay test; 59.3s total harness): both real pointer levels, authentic failure/replan, Clear/Undo/pause/reset, tiny input, resize and refresh. Network disabled after initial load; no failed asset requests or captured page errors. Evidence: evidence/production-e2e.json, desktop-qa.json and real raw video in submission/recordings/.
- Actual worker rapid-clear race passed: latest mask and decision revisions remain authoritative. Accessibility/help/recenter controls remained usable. A synthetic visibility event did not crash; actual OS background/foreground and repeated resource teardown soak still need verification. Unfamiliar human 60–90s onboarding remains unverified.
- Public trusted HTTPS host and availability throughout judging: requires approved deployment.
- Physical Quest 3/3S: all FPS, hand reliability, comfort, seated reach, permission behavior and text-legibility checks unverified. Run quest-test-script.md.

P0 release acceptance remains OPEN. Level 3 and Cloud P1 remain disabled and not tested as implemented features. No public deployment, video upload or final submission is claimed.

Dependency audit: patched generated sharp override from 0.35.4 to 0.35.5; npm install reports 0 vulnerabilities. Full audit retained.

## Final local gate
Strict typecheck, 13 engine tests, production build and production browser regression pass. Final Level 1/2 IWER hand regressions pass. Layout reserves space for desktop controls so they do not cover the bridge. Public hosting approval was granted for a new repository; authentication is pending. Build hash: 3bb2d00966e4e617ee4a07cbaaf6f818eb1623ab8be1f250618347f784f1b13c.
