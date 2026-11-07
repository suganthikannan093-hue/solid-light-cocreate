# QA report — 2026-11-07
## Verified environment and SDK
Intel x86_64 macOS 26.7.2, 16GiB RAM, Node 26.13.0; official IWSDK 1.1.0-rc.2 scaffold, IWER 2.7.0 Quest 3 emulation, managed Chromium. Linux GitHub Actions passed the P0 install/typecheck/unit/build/deploy workflow. Physical Quest is unavailable.

## Passed tests
- Strict TypeScript typecheck and production builds.
- 24 unit/integration tests across geometry and cloud suites: normal/tiny/empty/clipped/noisy/crossing contours; exact deterministic 32³ intersection; monotonic removal; real standable-surface BFS; thickness, 3×5-cell footprint and six-cell headroom; disconnected/elevation/overhead rejection; bounded planner; player ownership; valid input changes agent depth; Level 2 missing-X failure and three extensions; stale revision predicate.
- Garden constraints: deck-only fails shelter, roof-only fails path, complete shelter passes; low roof fails clearance; actual path footprint has canopy; sturdy uses more voxels than efficient without bypassing validation or changing human pixels.
- Cloud client/backend tests use mocked upstream responses (no paid API calls): missing key/config/consent, invalid JSON/schema/HTML, 429, lost network, timeout, request cap, minimized state, server credential boundary, and Vultr/OpenAI routing.
- Three production browser scenarios passed: default Levels 1 and 2 with real pointer input, offline after load, authentic failure → edit → replan → success; invalid/clear/undo/pause/reset and resize/refresh; experimental Garden with real drawing, missing-canopy recovery and both strategies; opt-in cloud outage with zero requests before consent and bounded local fallback after consent. The final garden geometry ownership fix passed its targeted rerun (evidence/production-e2e.json). The full final hosted suite is recorded in evidence/hosted-e2e.json after deployment.
- Actual worker rapid-clear race passed across message boundary: latest mask and result revisions remain authoritative. Accessibility/help/recenter remain usable. Synthetic visibility event did not crash (not an OS background test).
- Official IWER active hand input: Level 1 mask → 24 tested candidates → crossing; Level 2 spatial control, short span → real diagnosis → hand extension → replan → crossing; experimental Garden hand-drawn deck/canopy and verified crossing. Exact evidence: xr-hand-qa.json, xr-hand-result.json, xr-level2-qa.json, xr-garden-qa.json. Strategy choice is browser-tested; physical hand menu ergonomics remain unverified.
- Public P0 HTTPS deployment and full hosted playthrough passed: https://suganthikannan093-hue.github.io/solid-light-cocreate/ . Scene and worker paths under /solid-light-cocreate/ returned 200. Shared browser secure-context/Help interaction passed. Final experimental additions are being redeployed/rechecked.
- npm audit after sharp override 0.35.5: zero known vulnerabilities. Client JS scan contains neither provider credential environment names nor test credential marker. No production client key is configured.

## Defects found and corrected
- ES2020 replaceAll and launchXR void-return assumptions caught by compiler.
- Shared local preview rejected self-signed HTTPS: official SDK-managed Chromium used; public shared preview succeeded with trusted Pages certificate.
- Editor view hid runtime at 0×0: use Runtime view for interactions.
- Repeated development reloads exhausted WebGL contexts: explicit World.destroy hot-module teardown and browser restart.
- Immersive emulator overlay intercepted DOM clicks: exit XR for desktop tests; use spatial controls in XR.
- Fixed-layout body screenshot timed out: capture full page/runtime surface.
- Old worker could arrive during new stroke: invalidate revision on pointer down.
- Desktop toolbar covered bridge: reserve scene space above toolbar; production regression passed.
- Native fetch stored as object method caused browser illegal invocation: bind global fetch; actual cloud-outage browser test now confirms requests and fallback.
- Garden failure diagnostics could return a less informative final candidate: retain the most informative failed candidate; report real path-versus-shelter state.
- Software-rendered production tests exceeded 60s: Chromium Metal used; these timings are not Quest benchmarks.

## Evidence and remaining limits
Real screenshots are in submission/screenshots; real unedited silent recordings in submission/recordings. These are not physical Quest footage or a finished narrated submission video.

Physical Quest 3/3S FPS, hand reliability, seated reach, legibility, comfort, permissions, thermal behavior and OS background/foreground remain unverified. Unfamiliar-human 60–90s onboarding and a repeated resource-teardown soak also remain open. See quest-test-script.md and performance.md; measured desktop emulator results do not establish ≥60 FPS on Quest.

Cloud adapters/backend are implemented, but no real provider key/backend or fixed egress IP is configured or live-tested. Vultr source-IP allowlist must be owner-confirmed, and exact Agent Rush coupon applicability/expiry checked before billable use. No Vultr VM/inference resources or charges have been activated.

Submission drafts and build artifacts exist; eligibility/membership, narrated public video upload and final Devpost submission are owner actions. No final submission or public video URL is claimed.
