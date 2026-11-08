# Implementation status
Source of truth: master-specification.md. Accelerated single-day delivery; acceptance evidence remains mandatory.

| Milestone | Dependency | Acceptance | Status |
|---|---|---|---|
| Environment/input | Official generator / SDK | Selectable spatial drawing surface and real input | Passed; pinned IWSDK 1.1.0-rc.2 / IWER 2.7.0 |
| Geometry/planner | Input | Exact 32³ intersection, real walking validation, bounded search, revision guards | 31 unit tests passed across geometry, feedback and cloud |
| First Bridge | Geometry | Human loop → candidate tests → verified crossing | Production browser passed; updated IWER hand journey passed |
| Incomplete Span | First Bridge | Missing-X failure → human extension → replan and crossing | Production browser passed; updated IWER hand journey passed |
| Light Garden | Stable P0 | Path plus canopy, Sturdy/Efficient tradeoff | Default chapter 3; production browser and IWER hands passed |
| Last Spark/workshop | Garden | Actual voxel budget, human trim, varying constraints | Default chapter 4; unit, browser and IWER hands passed; four deterministic presets |
| Review feedback | Core journey | Live loop teaching, persistent stroke, gap hints, volume/readout, Settings/states, responsive framing | Six production browser scenarios passed; official hand journey and Settings/Mute passed; 161.60s real narrated capture passed |
| Optional OpenAI | Stable local game | Secret-holding backend, consent/schema/limits/fallback | Local backend/client tests passed; bounded real connectivity passed; public proxy not deployed |
| Release/video | Verified journey | Production build, hosted tests, real narrated capture, honest submission pack | Build passed; four-chapter build deployed; narrated MP4 ready; all six hosted browser scenarios passed |
| Physical Quest | Hardware | Hands, reach, legibility, comfort, permissions, sustained FPS | Unverified: no physical Quest available |

## Decisions and risks
- World units are meters; mask Y increases upward. V(x,y,z)=F(x,y)&S(z,y).
- The human owns F; LUMA owns S. An agent request never edits human pixels or fabricates a crossing.
- Rigid anchored light deck: at least three cells thick; normal creature footprint 3×5 cells; six cells of headroom; at most one-cell steps. Workshop presets vary the footprint. This is a discrete puzzle validator, not material stress simulation.
- Planner is a finite deterministic candidate search, not an LLM or arbitrary synthesis. Unusual solvable contours may still require a redraw.
- Four chapters and four workshop presets extend the actual decision space. Their existence is not a measured promise of playtime or replay value.
- Owner authorized a new public GitHub repository and Pages deployment. No final Devpost submission or third-party public video upload is performed.
- OpenAI is the selected optional provider. Its private credential is never shipped to the browser or stored in source. Public play remains local while backend hosting is unconfigured.
- Latest evidence supersedes earlier recordings. Browser/emulator evidence does not establish physical Quest performance.

## Environment
Intel x86_64 macOS 26.7.2, 16GiB RAM, Node 26.13.0 / npm 11.20.0. Official SDK scaffold and locked dependencies. Existing sibling projects remain untouched. The final local artifact and hashes are in release/build-manifest.json.

Garden follow-up: additive closed-loop drawing now preserves the path while the player adds a separate roof. Thin guide fixtures and six local production browser scenarios pass. The focused Level 2 → Garden hand-input and final hosted checks are tracked in evidence/xr-garden-additive.json and hosted-e2e.json; older recordings are historical.

The Garden follow-up is deployed: six hosted scenarios passed in 2.4 minutes, and the focused official IWER hand sequence passed Level 2 → Next → separate path/roof → crossing. Refreshed 161.60-second narrated footage and release archive are ready. Hardware testing remains open.

Latest follow-up implements guide inset tolerance, chapter-specific Help, persistent editing feedback, explicit contributor labels and a two-credit finale. Seven local browser scenarios passed, including clockwise/counter-clockwise fast imperfect mouse loops (one measured at 180ms, no inserted delays). Final hosted and emulator recovery/menus are being rechecked. The owner confirmed no Quest is available; physical tests and headset recording remain open.

Emulator XR follow-up (2026-11-07): drawing uses `pointOnFace`; tracking-loss copy is explicit and was proven mid-stroke in IWER; all four chapters passed again on hands. Primary submission video is the 100.9 s pinch-only Incomplete Span capture (`docs/submission/recordings/solid-light-xr-demo.mp4`). Seated 1.2 m / FOV 90° are emulator measurements. Physical Quest FPS, pinch reliability, seated comfort and headset recording remain unverified.

## Four-chapter completion follow-up — 2026-11-08
Chapters 1–4 and the finale passed the recorded sequential desktop journey with no page errors (`docs/evidence/four-chapter-qa.json`, recorded 04:25 UTC). The official IWER hand journey separately passed four crossings and the genuine missing-length, shelter and budget failures (`docs/evidence/xr-four-chapter-journey.json`). This is emulator evidence, not a physical headset playthrough.

Chapter 3 now explicitly guides the separate path and roof steps; Chapter 4 explains the trim and budget challenge. The finale credits both contributors and exposes all four completed chapters. Player-facing guidance uses pinch instructions. A remaining empty-outline planner diagnostic was corrected in this follow-up. TypeScript and all 31 unit tests passed again. The hosted shared-browser check opened the four-chapter build (`index-fasDvgCL.js`) successfully with pinch onboarding and a live game runtime. Physical Quest input, comfort and sustained frame rate remain unverified.
