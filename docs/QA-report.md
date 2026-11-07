# Executed QA report — 2026-11-07

## Current release checks
- Strict TypeScript and production build passed. Locked official IWSDK 1.1.0-rc.2 and IWER 2.7.0; Intel macOS / Node 26.13.
- 30 unit tests passed: deterministic mask intersection, rasterization/feedback, real standable-surface BFS, deck thickness/footprint/headroom, ownership and revision checks, bounded planning, shelter, budget/workshop presets, and cloud client/backend guards.
- Six production browser scenarios passed in 1.9 minutes: offline P0 play/recovery; cloud consent/outage fallback; instant rendered stroke/open-gap/coarse-loop success; control states/XR-unavailable/640px framing; Garden canopy and both strategies; Last Spark budget failure, trim and remix. `evidence/production-e2e.json` records this run. A final desktop FOV widening follows this run; the narrated capture and hosted suite check that final build.
- Official IWER hand journey passed all four chapters using real emulated hand selection and movement. Seven asserted states cover four crossings plus missing-X, insufficient-shelter and resource-budget failures. Each state asserts the correct chapter; input never writes the game state. Evidence: `evidence/xr-four-chapter-journey.json`.
- Updated spatial Next and Settings/Mute actions passed actual hand selection. Evidence: `evidence/xr-spatial-menu.json`. Active immersive completion screenshot: `submission/screenshots/14-four-chapter-xr-complete.png`.
- Active emulator performance sample: 120 frames, median 16.4ms / p95 18.5ms, 1,414 exposed instances, 70 draw calls, 56,924 triangles, worker 69.1ms. Uncalibrated desktop sample; no Quest FPS claim.
- OpenAI: a bounded real `gpt-4.1-mini` request returned HTTP 200 and schema-valid strategy JSON in 1.9 seconds. Two connectivity attempts were made. `evidence/openai-connection.json` contains no credential. Public gameplay still has no deployed inference proxy.
- Earlier worker rapid-clear test, native-fetch binding fix, public Pages/subpath/offline checks and original hand scenarios remain in the evidence directory; they are historical evidence, not a substitute for the current hosted run.

## Defects found and fixed
Live and persistent strokes, sparse corner handling, closing-gap feedback, animated loop teaching and actionable missing-length hints address the review's first-interaction failure. More informative failed-candidate selection distinguishes path, shelter and resource failures. Deck thickness, contiguous emissive cubes, different bank colors, a larger depth readout and a redesigned lightling improve proof of construction.

Settings groups secondary actions; explicit accessible names prevent the selected-chapter CSS marker from breaking selection. That defect caused a real browser failure; both affected scenarios passed after the fix. Pause/settings status, pressed toggles, meaningful contrast, adaptive framing, canvas labeling and visible XR failure are browser-tested.

Emulator automation initially skewed the stroke when interpolating rotating rays; using the established translated target-ray path fixed the test input. Separate CLI press/release calls were too slow to count as a click; the official normal select action verified spatial controls. Neither issue was worked around by weakening the game validator.

## Remaining limits
Physical Quest 3/3S input reliability, seated reach, legibility, comfort, permissions, sustained FPS/thermal behavior, OS background/foreground and cold offline loading remain unverified. There is no service worker. Unfamiliar-human onboarding and long resource soak remain open. See quest-test-script.md.

Final hosted regression and narrated video status are recorded in hosted-e2e.json and submission/video-manifest.json when completed. No public YouTube/Vimeo upload, owner eligibility confirmation or Devpost submission is claimed. The public cloud proxy is not deployed.

## Narrated capture
Real production four-chapter progression passed through actual mouse input, including expected failure types and recovery controls. Narrated MP4 is 159.32 seconds, H.264/AAC 1280×800, 6.51 MB. The final image contact sheet was inspected; game audio and narration are present, measured mean −19.9 dB / peak −4.4 dB. Captions and timeline are retained. Narrator is locally synthesized Samantha. This is desktop capture, not physical Quest footage.

## Final hosted regression
All six scenarios passed against the deployed Pages build in 2.0 minutes. Garden and Last Spark explicitly disabled browser networking after initial load, as did the P0 playthrough. The final FOV framing, live drawing, status/toggle/unsupported-XR behavior and cloud-outage recovery passed on the hosted artifact. Evidence: evidence/hosted-e2e.json. GitHub Actions run 42386728339 passed install/typecheck/unit/build/deploy for application source aa9f3a8.

## Garden follow-up regression
31 unit tests and all six local production browser scenarios passed. The new Garden scenario enters through Level 2 Next, draws the actual thin lower guide, observes the shelter request, confirms an open roof attempt preserves the path, adds an independent roof loop, checks empty air rows, undoes/re-adds the roof, and completes both strategies offline after loading. Title, hidden legacy desktop plane, bounded sparks, disabled-Next styling and High contrast aria-live feedback are asserted. A later intermediate-status wording change is checked by the updated emulator/hosted probes. Physical Quest remains unverified.

The focused official IWER hand sequence also passed: complete Level 2, select spatial Next, draw the thin Garden path, receive the real shelter request, add a separate roof loop, and cross. The final hand-drawn mask has path pixels, roof pixels and zero occupied air rows between. Evidence: evidence/xr-garden-additive.json; screenshot 15-garden-additive-xr.png. This remains emulator evidence, not physical Quest testing.
