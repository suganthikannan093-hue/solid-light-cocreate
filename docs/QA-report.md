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

## Final Garden hosted result
All six hosted scenarios passed in 2.4 minutes against source a594328, including the new two-loop Garden and open-stroke/Undo recovery, offline after loading, P0 regression, budget/remix, controls, High contrast announcement and XR fallback. The shared browser also loaded bundle index-BrmumEaP.js, observed HTTP 200 for scene/worker assets, opened Settings → Level 3, and found the new instruction with no console errors.

The refreshed real four-chapter demo is 161.60 seconds (H.264/AAC), with conversational AI-generated marin narration, original game audio and synchronized captions. It demonstrates the separate roof loop. Audio mean −21.1 dB / peak −4.4 dB; artifact/video hashes verified and compact contact sheet inspected. The release archive identifies application source a594328.

## Forgiveness / contribution / ending follow-up
31 unit tests passed, including guide loops drawn slightly inside the target. Seven local browser scenarios passed, including clockwise/counter-clockwise imperfect mouse loops with five samples and zero explicit delays (180ms for one stroke), and persistent Clear/Undo feedback. The final layering correction then passed the focused Garden regression in 1.1 minutes: a bright spark was deliberately moved closer than the drawing board on the same camera ray; a 24×24 rendered pixel region was identical before and after. Boards keep depth testing and sparks do not write depth. Evidence: production-e2e-seven-scenarios.json and garden-occlusion-e2e.json.

Official IWER completed a closed-but-still-held stroke disconnection without committing any pixels, reconnected, completed all four chapters and used the spatial Settings/Mute controls. Evidence: xr-four-chapter-journey.json (nine result entries) and xr-spatial-menu.json. The completed scene credits the human and LUMA separately; screenshot 16-created-together-xr.png was inspected. This is emulator evidence. The owner confirmed no Quest is available, so physical hand tracking, comfort, readability, tracking-loss recovery and original headset footage are not claimed.

## Emulator XR demo and tracking-loss follow-up
31 unit tests passed after pinch-first copy and tracking-loss recovery messaging. Official IWER hand input then passed, in one run: mid-stroke hand disconnect with zero committed pixels and the copy “Hand tracking lost. Your outline is safe. Pinch again when your hands reappear.”; reconnection; all four chapters with the real missing-X, shelter and budget failures. Evidence: `evidence/xr-four-chapter-journey.json` (nine results, first entry is tracking-loss).

Planar ink now samples IWSDK `pointOnFace` so a fixed-origin rotating ray matches the aimed board cell. Evidence: `evidence/planar-pointer-projection-before.json` and `evidence/xr-fixed-origin-ray.json`.

Seated emulator headset at 1.2 m and reported FOV 90°: `evidence/xr-seated-qa.json`. This is not physical seated reach or Quest FOV.

Primary competition capture is the 100.9 s XR hand demo (`docs/submission/recordings/solid-light-xr-demo.mp4`, H.264/AAC 1280×720, 3.56 MB, SHA256 `cc698539940c3893987c79d4bc8b7587f1285029f4004383bf571f063f82e83a`). It is real IWER hand drawing of Incomplete Span: pinch a short ribbon, LUMA’s missing-length diagnosis, human extension, traveler crossing. Narration is OpenAI marin, pinch/VR only; captions contain no “mouse” or “click”. Physical Quest FPS, pinch reliability and headset recording remain unverified.

## Four-chapter completion follow-up — 2026-11-08
Chapters 1–4 and the finale passed the recorded sequential desktop journey with no page errors (`docs/evidence/four-chapter-qa.json`, recorded 04:25 UTC). The official IWER hand journey separately passed four crossings and the genuine missing-length, shelter and budget failures (`docs/evidence/xr-four-chapter-journey.json`). This is emulator evidence, not a physical headset playthrough.

Chapter 3 now explicitly guides the separate path and roof steps; Chapter 4 explains the trim and budget challenge. The finale credits both contributors and exposes all four completed chapters. Player-facing guidance uses pinch instructions. A remaining empty-outline planner diagnostic was corrected in this follow-up. TypeScript and all 31 unit tests passed again. The hosted shared-browser check opened the four-chapter build (`index-fasDvgCL.js`) successfully with pinch onboarding and a live game runtime. Physical Quest input, comfort and sustained frame rate remain unverified.

## Voice and ambient score follow-up — 2026-11-08
The official managed-browser audio test passed first-gesture unlock, voice/music output, master mute (measured output RMS zero), pause/resume, chapter voice replacement and offline-after-load playback of the bundled assets. All 12 audio assets decoded. A captured browser mix (`evidence/audio-preview.webm`) measured mean −17.6 dB / peak −4.0 dB; these are audio levels, not a device performance benchmark. Evidence: `evidence/audio-qa.json`. All four chapters and the finale passed the actual-input regression again with the audio change (`evidence/four-chapter-qa.json`), with zero page errors. TypeScript and all 31 unit tests passed. Physical Quest speaker/headphone output remains unverified.

The ambient score also passed a 33-second music-only loop-boundary check (`docs/evidence/audio-music-qa.json`). In an active official IWER immersive session, hand Settings/Mute controls passed and the audio mix remained running with nonzero output (`docs/evidence/xr-audio-qa.json`). Production build passed with all 12 bundled AAC assets. These remain desktop/emulator observations.
