# SOLID LIGHT: CO-CREATE — Master Build Brief for Codex / Grok

**Version:** 3.0 — 2026-11-07  
**Project type:** Meta Quest hands-first immersive WebXR puzzle game  
**Competition:** Meta VR Start Developer Competition 2026 — Gaming / New Experience (subject to entrant eligibility and confirmation)  
**Primary award strategy:** Best New Gaming Experience  
**Special-award focus:** Best Agentic Interaction; secondary: Best First Five Minutes, Boldest Original Concept  
**Required delivery:** A working, polished, hosted WebXR experience, source code, tests, and complete submission-ready materials.  
**Submission deadline:** November 18, 2026, 12:00 PM Pacific Time; plan to be submission-ready on November 17.  

---

## 0. Instructions to the coding agent (read first)

You are the **technical lead, senior immersive-web engineer, gameplay designer, AI-agent engineer, and QA owner** for **SOLID LIGHT: CO-CREATE**. You are not writing a theoretical plan: **implement, test, debug, and document a playable project in the actual repository.**

- **Proceed autonomously in small verifiable increments.** Do not pause after a plan or replace implementation with pseudo-code. Make reasonable implementation choices, record them, and continue. Ask for human action only when genuinely required (account access, paid API credentials, actual headset test, or final publishing/submission).
- **Do not invent SDK interfaces.** Inspect the installed Meta IWSDK version, locally generated `AGENTS.md`, SDK docs, and working examples before adding imports or configuring systems. Use the current official docs linked at the end of this brief. If a documented method is unavailable in the installed version, adapt based on verified code rather than claiming success.
- **Use the existing repo when present.** Inspect it first. Do not overwrite user changes, force reset, delete unrelated files, or rewrite working foundations unnecessarily. Create the IWSDK project only if none exists.
- **Make the application fully functional without a cloud LLM, paid service, Quest headset, sensor, or controller.** Cloud inference is an **optional P1 mode**, retained in the plan and architected from the start, not a dependency of the core game.
- **Maintain both Level 3 and Cloud LLM in the roadmap.** They are not removed. Implement them after the required Levels 1 and 2 pass their acceptance gates and the submission-critical assets are prepared. If time remains and quality is stable, implement both; otherwise leave feature-complete interfaces, an explicit implementation backlog, and honest status flags—never fake functionality.
- **Never claim device-tested performance without testing on a physical Quest.** Desktop IWER is an emulator. Capture actual diagnostic evidence and enumerate unverified hardware items.
- **Never claim that the local planner is an LLM.** Describe it accurately as a bounded goal-directed construction agent using tools, geometric validation, state, and replanning.
- **Treat the four judging criteria as equally important:** innovation/creativity, experience design, technical implementation, polish/presentation.
- **Always keep the game playable.** Prefer feature flags, small commits, tests, and an executable demo to broad unverified changes.
- **No submission or third-party account actions without owner approval.** Prepare the production build and materials, but don't pretend to have joined Meta Start, uploaded a video, submitted on Devpost, or published externally unless those actions actually occurred.

### Definition of successful output

At minimum, a new player can launch the app, learn pinch-drawing through visual affordances, co-create a **functional bridge** with LUMA in Level 1, observe LUMA detect and recover from a **geometrically constrained failure** in Level 2, and complete a stable, polished session using **desktop interaction and emulated XR hands**, without internet AI calls or manual debugging. The app can build to static files for public HTTPS hosting. All evidence and release materials are present.

---

## 1. Environment and execution constraints

**Developer environment:** Intel-based MacBook Pro (macOS), ChatGPT Plus with Codex access, optionally Grokbot, no physical Quest headset, no paid LLM API credits assumed, minimal/no additional budget.

**Preferred implementation:** TypeScript, Vite, Meta Immersive Web SDK (**IWSDK**), Three.js, its ECS runtime, and Immersive Web Emulation Runtime (**IWER**) for desktop VR simulation. Use Vitest or a comparable TypeScript test runner, Playwright and/or IWSDK runtime MCP tools where available. Avoid heavyweight Unity/Unreal dependencies for this build.

**Mandatory compatibility checks on first run:**
1. Inspect OS, CPU architecture, Node.js/npm, git, browsers, current repo, package scripts, and available disk/RAM.
2. Meta IWSDK docs specify Node `20.19+` in the Node 20 line, `22.12+` in Node 22, or Node 24+; check active project requirements and propose a non-destructive install path if missing. Never assume Homebrew exists on this Intel Mac.
3. If starting fresh, use the official project generator `npm create @iwsdk@latest` and select a VR-first, desktop-testable TypeScript starter. If the generator supports mixed reality, keep passthrough as a progressive optional enhancement, **not** a required runtime dependency.
4. Follow the generated `iwsdk.config.json`, official Vite plugin, and IWSDK ECS conventions. Avoid guessing raw WebXR input/gesture APIs when the SDK offers a supported path.
5. Configure a browser-first preview and IWER Quest emulator input mode. If supported, use the IWSDK managed tooling (`npx iwsdk dev up`, `npx iwsdk dev status`) and MCP-based scene/input inspection for agent-driven QA.
6. Work in **small feature branches or incremental commits** where practical. Keep a continuously usable `npm run dev` and `npm run build`.

**Official references (verify before implementing):**
- Competition: https://start-developer-competition-26.devpost.com/rules
- IWSDK project setup: https://developers.meta.com/vr/documentation/iwsdk/guides/01-project-setup/
- IWSDK browser/Quest testing: https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/
- IWSDK input and interactions: https://developers.meta.com/vr/documentation/iwsdk/guides/06-built-in-interactions/
- IWSDK AI-native development: https://developers.meta.com/vr/documentation/iwsdk/ai/
- IWSDK browser-first systems: https://developers.meta.com/vr/documentation/iwsdk/guides/16-browser-first-systems/
- IWSDK backends: https://developers.meta.com/vr/documentation/iwsdk/guides/18-platform-services/

---

## 2. Product vision and originality

**Title:** SOLID LIGHT: CO-CREATE  
**Tagline:** Two minds. Two perspectives. One impossible creation.  
**Pitch:** The player and an autonomous spatial construction agent called **LUMA** each control one of two perpendicular silhouettes. Their intersecting projections become glowing, functional 3D structures. The agent constructs, tests, discovers constraints, revises its plans, and asks the human for only the changes it cannot make. Together, they help a tiny creature navigate a magical world.

**Our differentiator is the collaboration contract, not merely shadows or voxel geometry.** The human has exclusive authorship of the **front** projection; LUMA has exclusive authorship of the **side** projection. Neither may silently edit the other's work. Both projections are needed to create the final structure. Constraints are real and visible. A new player should understand why the AI cannot solve everything alone.

**Core experience test:** If the AI is removed, the player loses a meaningful co-creator with independent planning. If spatial geometry is flattened to a 2D UI, the underlying experience loses crucial perspective, depth, and physicality. Avoid an AI chatbot bolted onto a conventional game.

**Tone and aesthetics:** Calm magical engineering studio; luminous glass and etched-light materials; teal/cyan for player, warm amber for LUMA; soft indigo background; expressive creature; elegant audio and tactile visual feedback. Avoid generic admin dashboards or overwhelming floating text. Procedural or original art only; appropriately license any third-party assets.

---

## 3. Player journey, controls, and first five minutes

### Session structure
- **0–15 seconds:** See a floating broken path and the waiting creature. LUMA visually invites action; no large tutorial modal.
- **15–35 seconds:** The user draws a simple contour on a translucent vertical plane using hand pinch-and-drag (desktop: click-drag). The outline fills automatically, with continuous live preview of its effect.
- **35–55 seconds:** LUMA independently draws its complementary projection on an orthogonal plane. Glowing voxel structure materializes with a short, responsive animation.
- **55–90 seconds:** A tiny test-runner or creature traverses the new object; bridge works, world reacts with an emotionally satisfying payoff.
- **Next 1–3 minutes:** Level 2 starts with a visible, intentionally constrained geometry problem. LUMA independently attempts candidate shapes, validates them, finds the player-side constraint, highlights exactly where to widen/extend, and succeeds after the player's correction.
- **End:** Clear celebration, replay/restart, ability to inspect how human and agent contributed, and optional invitation to Level 3 when implemented.

### Hand-first interaction requirements
- Direct pinch-draw on a floating plane; gaze/hand-ray targeting where supported by the SDK; large, forgiving targets; no controllers needed to reach core functionality.
- Pointer and mouse equivalent on desktop for every critical action.
- The only required gestures should be target/select/drag/release; no compulsory two-hand coordination, voice command, or tiny pinching hotspots.
- When a player starts drawing, show target plane and point of contact. Show smooth stroke, close loop automatically when appropriate, fill mask, and preview the 3D solid **while drawing** using an efficient update policy.
- Provide undo, clear, reset-level, recenter, pause, and help; no unrecoverable states.
- Robust input: stroke smoothing (e.g. EMA/One Euro), sampling/point spacing, bounded resampling, snap-to-close within threshold, polygon fill with explicit treatment of self-intersections and invalid contours; visualize what the app understood.
- Never silently accept an empty/invalid/unclosed shape as success. Provide friendly, visible guidance and an easy redo.
- For focus/vision comfort: keep key elements in a comfortable central field, seated scale, readable text at depth, avoid unnecessary head turns, camera shake, and sudden movement.
- Include color-independent visual semantics, high-contrast toggle, reduced-motion mode, audio mute/volume, one-handed play, and desktop accessible controls. If gaze-and-pinch is supported reliably, test it; do not assert accessible eyes-only navigation if unimplemented.

### Product UX states
`welcome`, `onboarding`, `drawing`, `previewing`, `agent-planning`, `agent-testing`, `needs-user`, `construction-success`, `level-complete`, `pause`, `recoverable-error`.
All states must have meaningful user feedback and valid transitions. Every async operation must time out or yield an actionable state.

---

## 4. Core geometry and engineering correctness

### Coordinate conventions
Define world units and keep them consistent (meters or normalized units documented). Example:
- The human front mask is `F(x,y)` on the XY plane.
- LUMA's side mask is `S(z,y)` on the ZY plane.
- A voxel exists when `V(x,y,z) = F(x,y) AND S(z,y)`.

Two silhouettes do **not** generate arbitrary geometry. Use that constraint deliberately in puzzle design; do not invent geometry that the intersection cannot represent.

### Geometry pipeline
1. Capture outlines into normalized 2D coordinates, maintaining world-plane transforms.
2. Close and rasterize them into binary masks; support erase/undo safely.
3. Build a low-resolution **preview** voxel intersection, initially `32 x 32 x 32` (lower resolution while drawing when needed).
4. Convert only exposed occupied voxels to visible geometry. Prefer an instanced-cube or merged-face mesh renderer over marching cubes for initial delivery. No separate draw call per voxel.
5. Generate collision / occupancy data from the same authoritative voxel representation; never make render-only bridges that cannot be validated.
6. Validate endpoint reachability, floor continuity, deck height, clearances, and other required structural constraints with a clearly documented rule set.
7. Run A* or BFS on a **walkability graph**, not naively on all solid voxels. Identify standable surfaces or precomputed allowed cells, check slopes/step heights where applicable, and confirm the creature's footprint/clearance.
8. Process expensive geometry validation and agent candidate search in Web Workers when browser support permits; version each calculation request and discard stale results after the next player edit. Avoid serializing large redundant structures.
9. Keep the render loop responsive; use debounced/throttled preview generation and bounded work quotas. Provide explicit progress states and an abort/retry path.

### Numerical and simulation invariants
- Identical masks + world inputs yield identical occupancy and validation results.
- Intersection is monotonic with respect to each mask: removing filled pixels cannot create new occupied voxels.
- Empty input results in an empty structure with understandable feedback (no exception).
- Invalid or self-intersecting contours are repaired deterministically or rejected gracefully.
- Invalid agent candidates cannot be committed as successful structures.
- Path validation considers **the geometry that is actually created**, not a preauthored invisible bridge.
- Frame rendering never blocks indefinitely on reconstruction or pathfinding.
- Generated visuals should reflect structural truth: no misleading hidden fixes.

---

## 5. LUMA — real autonomous spatial-construction agent (P0)

LUMA must visibly demonstrate a **goal -> observe -> propose -> execute tool -> test -> replan -> request human action** cycle. It must not merely play prerecorded dialogue or always select a fixed shape regardless of player input.

### Agency boundaries
- **Human owns** `frontMask`. Only user input changes this mask.
- **LUMA owns** `sideMask`. LUMA may propose, apply, and revise this mask.
- LUMA may request a specific correction to the human's mask but **may never silently edit it**.
- A deterministic, bounded, **offline** search-based planner is the P0 reasoning implementation. No network needed.
- Agent actions and outcomes should be interpretable in-world through animation, brief labels/icons, highlighted suggested region, and an optional inspection panel.
- Maintain an event log for tests and demo evidence (e.g. candidate evaluated, test failed with reason, revision selected, user input requested).

### Required agent state and tools
Implement typed, testable interfaces approximately like the following; adapt to actual application architecture:

```ts
type AgentPhase =
  | 'observing' | 'planning' | 'constructing' | 'testing'
  | 'replanning' | 'needs-user' | 'success' | 'unable-to-solve';

type FailureReason =
  | 'EMPTY_USER_MASK' | 'DISCONNECTED_SPAN' | 'INSUFFICIENT_CLEARANCE'
  | 'UNSUPPORTED_PATH' | 'NO_WALKABLE_PATH' | 'TIME_BUDGET_EXCEEDED'
  | 'INVALID_CANDIDATE';

interface WorldSnapshot {
  revision: number;
  levelId: string;
  playerMask: Uint8Array;
  agentMask: Uint8Array;
  gridSize: number;
  goal: LevelGoal;
  previousAttempts: AttemptSummary[];
}

interface CandidateResult {
  candidateId: string;
  agentMask: Uint8Array;
  score: number;
  isValid: boolean;
  path?: Array<[number, number, number]>;
  failures: FailureReason[];
  diagnostics: GeometryDiagnostic[];
}

interface ConstructionAgent {
  observe(world: WorldSnapshot): Promise<AgentObservation>;
  proposeCandidates(input: AgentObservation, budget: SearchBudget): Promise<Uint8Array[]>;
  testCandidate(world: WorldSnapshot, agentMask: Uint8Array): Promise<CandidateResult>;
  selectAction(results: CandidateResult[]): AgentDecision;
  replan(world: WorldSnapshot, reason: FailureReason): Promise<AgentDecision>;
}
```

Define and implement `LevelGoal`, `AttemptSummary`, `GeometryDiagnostic`, `AgentObservation`, `SearchBudget`, and `AgentDecision` in the actual codebase. Do not leave these as hollow types.

**Agent tools must be real:** `inspectWorld`, `proposeProjection`, `applyAgentProjection`, `buildIntersection`, `validateSupport`, `findWalkablePath`, `diagnoseConstraint`, `requestHumanEdit`, `commitConstruction`.

**Planner strategy:** Generate bounded candidate side masks using parameterized shapes (platform widths, thicknesses, side contours, supporting forms). Evaluate geometry, path validity, robustness, and aesthetic plausibility; rank candidates with documented scoring; record failures; replan when user edits or test fails. Make this deterministic under a seed for reproducible QA. Limit attempts and compute budgets; return a helpful `unable-to-solve` state rather than hanging.

**Agent evaluation/visualization:** Clearly show when the AI proposes, tests, fails, asks for help, and improves. A subtle highlight should precede the full optional correction preview. Don't rely on a large wall of text or exaggerated claims about intelligence.

---

## 6. Level requirements and acceptance gates

### LEVEL 1 — The First Bridge — **P0**

**Situation:** A tiny luminous creature needs to cross a short gap between two anchored banks. The human draws a front-view outline that can span the gap. LUMA draws the side-view profile so the generated intersection creates a sufficient deck/width/height for traversal.

**Requirements:**
- Guide the first shape with a faint visual template; no mandatory reading.
- The player must participate by drawing or editing their mask; no automatic completion by LUMA.
- While drawing, show a responsive projection preview.
- LUMA evaluates real candidate side masks and selects a valid one.
- The bridge's walkability must be checked against actual generated occupancy.
- The creature traverses that verified path and reaches the opposite bank.
- Show a delightful, short victory animation, then offer Level 2.

**Accept only if:** First-time tester can complete it in approximately 60–90 seconds; replay/restart works; different valid drawings lead to different generated structures; no hardcoded invisible walkway substitutes for the object.

### LEVEL 2 — The Incomplete Span — **P0, NOT OPTIONAL**

**Situation:** A wider gap (or more demanding reachability constraint) makes the player's starting front silhouette stop short of the far bank along X. Because LUMA only controls the YZ silhouette, no side-mask can invent occupancy at the missing X positions. This is a genuine impossibility caused by the two-projection mathematical constraint.

**Required visible sequence:**
1. Guided starter shape creates the intended insufficient X-span (the **initial condition** is staged).
2. LUMA runs its **actual** candidate search and validator; it does not merely play a pre-scripted failure animation.
3. The validator reports `DISCONNECTED_SPAN` or equivalent diagnosis based on missing reachable occupancy.
4. LUMA highlights the precise section of the player's plane that must be extended/widened; the guidance is geometrically grounded.
5. LUMA **requests**, but does not itself perform, the human edit.
6. Player changes the front mask; LUMA detects the new revision, replans, and finds a different or updated side projection.
7. The revised real geometry passes A* and walkability checks; creature crosses and success is earned.

**Accept only if:**
- The standard demo path reliably presents the failure/replan moment.
- Unfamiliar alternate player drawings change the diagnosis or candidate search results appropriately.
- If the player supplies an already sufficient shape, LUMA may succeed directly rather than falsely claim failure.
- If the user clears the mask, draws nonsense, or abandons the action, LUMA returns usable guidance without a hang.

### LEVEL 3 — The Light Garden — **P1, RETAIN IN PLAN**

**Situation:** The player and LUMA must build a usable object that satisfies **two constraints at once**, for example: bridge connectivity plus protective clearance against falling light-particles, or a higher elevated walkway with an obstacle below. Make this mechanically distinct but implement it using the same two-mask geometry and validation primitives.

**Requirements when built:**
- New visual setting or meaningful transformation of the original world, without requiring a second engine.
- Two independent validation constraints; clear visual feedback for both.
- LUMA proposes and tests multiple candidates; player mask remains player-owned.
- One optional strategic choice (sturdy/wide vs elegant/resource-efficient) with visible tradeoff.
- Short finale and replay control.

**P1 acceptance:** Finishable using existing hands-first controls; no unexplained new gesture; both constraints actually checked. **If incomplete by feature freeze, keep Level 3 explicitly marked 'planned / not playable' in release notes; do not present it as finished or lead judges to a broken level.**

---

## 7. Optional Cloud LLM planning mode — **P1, RETAIN IN PLAN**

The offline LUMA planner is always available and handles every critical scenario, including failure and recovery. A cloud LLM is **optional enhancement**, not core gameplay, and must never be required for judges to finish Levels 1 and 2.

### Intended LLM uses
- Generate concise, context-aware explanations of geometrical constraints.
- Propose high-level construction strategies or candidate parameter ranges.
- Add occasional personality/flavor to LUMA, without flooding the UI with text.
- **Not** directly alter the user's silhouette, bypass validation, invoke unbounded tools, or claim success without the local geometry engine confirming it.

### Architecture
Define a `StrategyProvider` with two interchangeable implementations:
- `OfflineStrategyProvider` (P0): deterministic bounded planner, always available.
- `CloudStrategyProvider` (P1): HTTPS backend to a user-configurable supported LLM service, with robust JSON schema validation. Never ship the provider API key in front-end code or a static hosting environment variable exposed to the browser.

The browser requests only safe, minimized, structured world state; the backend stores secrets and enforces request limits. The model may **suggest a plan**, but the local validation worker authoritatively builds and validates geometry. Explicit tool-call whitelists, bounded turns, sanitization, and read-only state minimize risk.

**Strict fallback:** on missing key, HTTP error, malformed output, slow response, rate limit, timeout, offline status, or backend outage, automatically return to `OfflineStrategyProvider` with clear non-blocking status. No paid API call runs by default or without explicit configuration/consent.

**P1 acceptance tests:** Cloud provider on/off both yield a playable game; schema rejects invalid outputs; API key absent from production client bundle; timeout/rate-limit tests pass; no dependency on ChatGPT Plus granting API credits.

---

## 8. Technical architecture and repository layout

Prefer the generated IWSDK conventions; this is a logical organization, not a demand to replace generated files:

```text
solid-light-cocreate/
  AGENTS.md                        # agent-specific repo instructions, preserve SDK-generated guidance
  README.md
  package.json
  iwsdk.config.json
  public/
    scenes/
    assets/
  src/
    app/                          # bootstrapping, mode/feature flags, error boundary
    xr/                           # IWSDK systems, input and spatial panels
    scene/                        # world, lighting, holographic rendering, creature
    drawing/                      # normalized strokes, smoothing, masks, undo
    geometry/                     # voxel intersection, exposed cube instances
    validation/                   # walkability, structural tests, A*, diagnostics
    agents/                       # LUMA states, tools, search, offline provider
    levels/                       # Level 1, Level 2, planned Level 3
    audio/                        # original responsive sounds
    ui/                           # spatial labels, settings, states
    workers/                      # versioned geometry/validation computation
    optional-cloud/               # client provider adapter; secrets NEVER here
    shared/                       # type definitions, errors, logging
  server/                          # optional P1 cloud backend, if activated
  tests/
    unit/
    integration/
    e2e/
    fixtures/
  docs/
    PRD.md
    architecture.md
    acceptance-criteria.md
    QA-report.md
    performance.md
    known-limitations.md
    implementation-status.md
    submission/
      devpost-description.md
      video-script.md
      video-shot-list.md
      reviewer-instructions.md
      screenshots/               # capture from working app; no fabricated images
      checklist.md
```

### Required core interfaces
- `Mask2D`: size, pixels, revision, coordinate transforms.
- `VoxelVolume`: dimensions, occupancy, bounds, revision.
- `LevelGoal`: source/target endpoints, creature dimensions, path clearance, environmental constraints.
- `ValidationReport`: pass/fail, failures, geometric diagnostics, walkable path, candidate score.
- `AgentDecision`: select candidate, edit agent mask, ask human, retry, fail gracefully.
- `GameState`: level, UI state, player mask, LUMA mask, snapshot ID, telemetry.
- `FeatureFlags`: `enableLevel3`, `enableCloudLLM`, `enablePassthrough` (disabled unless tested).

Use strict TypeScript types and structured errors; avoid unbounded `any`. Use deterministic seeds for fixture levels.

### Startup and runtime robustness
- Feature-detect XR rather than assuming a device from the user-agent string.
- Desktop mode and emulated immersive mode must both expose the core gameplay.
- Unexpected XR session exits should return to a stable menu/state, not a blank page.
- Disable nonexistent settings. Never present a dead button; P1 options should be hidden or clearly labeled unavailable in the public submission.
- Prevent stale worker responses from replacing new masks after quick edits.
- Clean up listeners, workers, geometry, materials and animation loops on scene changes.

---

## 9. Four-criterion judging quality targets

These are **internal standards**, not claims of Meta endorsement or guaranteed scores.

### A. Innovation & Creativity (25%)
- The two-perspective constraint is immediately recognizable and visually demonstrated.
- The agent visibly takes independent actions, tests its creation, and asks for help when it reaches a genuine constraint.
- The resulting 3D geometry has direct consequences for a living character.
- A replay with a different player drawing yields a meaningfully different generated object.
- Competition copy accurately credits established visual-hull/shadow-puzzle ideas while highlighting the cooperative agent mechanic.

### B. Experience Design (25%)
- New player gets a successful result in ~60–90 seconds without a wall of text.
- LUMA's failure/replanning beat is readable visually; no mandatory technical jargon.
- Primary actions are hands-first with desktop and optional gaze fallback.
- High contrast, reduced motion, comfortable seated reach, recentering, simple restart, recoverable errors.
- User never waits silently: show bounded computation state, progress, and actionable fallback.

### C. Technical Implementation (25%)
- No runtime exceptions in the judged path; deterministic tests for core geometry and validation.
- Render approach minimizes draw calls and memory pressure (instancing/merged visible faces, bounded grid).
- Avoid main-thread frame stalls; worker compute budgets and stale-result cancellation.
- **Target >= 60 FPS on Quest 3/3S**. This is a target until physical device measurement; desktop IWER FPS is only indicative.
- Test XR enter/exit, simulated hands, pinch drawing, browser pointer fallback, and browser resize/visibility changes.

### D. Polish & Presentation (25%)
- Consistent art direction (glowing glass, cyan vs amber authorship, rich but restrained particles).
- Coherent, original sound cues for drawing, materializing, failed validation, LUMA asking for help, and success.
- Strong first-minute emotional payoff; satisfying creature motion.
- Clear explanatory materials: why the AI is genuinely agentic, how the geometry works, limits/requirements, and real gameplay footage.
- No generated mock footage misrepresented as playable capture.

---

## 10. Testing and acceptance suite

### Unit tests (required)
1. Mask closure and rasterization on normal, tiny, empty, self-intersecting, edge-clipped and noisy strokes.
2. Orthogonal silhouette intersection invariants, bounds and determinism.
3. Walkable-path generation on gap-connected, disconnected, overhang, thin/unsupported, and obstructed shapes.
4. Planner boundedness: search terminates within configured budget; no infinite loops; meaningful reason codes.
5. LUMA agency: player mask never modified by agent; agent projection changes after different user input.
6. Level 2: initial short-span fails because missing X occupancy; after a valid human extension, at least one candidate passes and the creature can cross.
7. Worker revision race: stale messages ignored, latest revision remains authoritative.
8. Optional cloud provider: malformed response, lost connection, timeout, missing key, request cap, local fallback.

### Integration and browser/E2E tests (required)
- Cold launch, onboarding, level selection, Level 1 success, Level 2 failure/replan/success, restart, pause/resume.
- Desktop pointer full playthrough without headset.
- IWER simulated hand selection/draw/release as far as tooling allows. Collect logs/screenshots using working SDK/MCP tools.
- Invalid stroke, repeated rapid edits, refresh midway, viewport change, lost XR session, no network.
- Production build serves from HTTPS/static host with working asset paths; no missing assets or CORS blockers.

### Performance evidence
- Gather browser frame stats, scene draw calls/geometry count, worker timings, and peak memory where observable.
- Record precisely **what was tested on Intel desktop/IWER** and what still requires **Quest hardware**.
- If an external Quest tester can help, give them an exact test script and capture: headset model, browser version, approx FPS/perceptual smoothness, hand-input reliability, text legibility, comfort, blocking bugs.
- Do not put fabricated Quest benchmarks in the README or submission.

### Release acceptance gate
P0 is complete only if:
- Levels 1 AND 2 pass end-to-end without cloud connectivity.
- Level 2 visibly demonstrates **actual** failure detection, requested human edit, and agent replan.
- Invalid input never crashes or deadlocks.
- Production build and public HTTPS staging test succeed.
- Submission draft, shot list, and checklist exist and are accurate.
- A person can follow reviewer instructions without developer guidance.

---

## 11. Milestones, priority and time box

**P0 — Submission-blocking:** environment setup; game loop; two drawing planes; smooth/filled masks; real-time geometry preview; 32^3 (or similarly bounded) voxel pipeline; collision/walkability validation; offline LUMA agent planner; Levels 1 and 2; hands-first/desktop/emulator input; minimal accessibility; art/audio polish; error recovery; tests; production build; video evidence and Devpost materials.

**P1 — Retained and planned, do not erase:** Level 3; optional secure Cloud LLM strategy/explanation backend; extra audio/visual variants; expanded replayability. Start P1 only after P0 launch path is solid. Implement P1 sequentially with feature flags so any incomplete optional feature can be disabled safely.

**P2 — Future release:** multiplayer, additional worlds/levels, persistent progression, rich analytics, procedural campaigns, user accounts, advanced MR surface placement, natural voice conversation.

### Proposed schedule (2026)
| Dates | Gate | Required evidence |
|---|---|---|
| Nov 7–8 | Environment + core interaction | SDK running, drawing surface working in desktop/IWER |
| Nov 9–10 | Geometry engine | Player mask + agent mask make valid visible voxel object; tests |
| Nov 11–12 | Level 1 + agent planner | Full bridge success, event log, video evidence |
| Nov 13–14 | Level 2 essential agentic beat | Failure -> diagnosis -> human edit -> replanning -> success |
| Nov 15 | P0 feature freeze | Tests green, polished complete path, release artifacts started |
| Nov 16 | P1 only if safe + QA | Level 3 and/or Cloud LLM behind flags; Quest external test if possible |
| Nov 17 | Submission readiness | Hosted link, video under 3 min, descriptions, checklist |
| Nov 18 | Deadline buffer | Owner verifies final Devpost entry before noon Pacific |

**If behind schedule:** preserve Levels 1 & 2, offline agent, hands-first interactions, stability, and submission materials. Defer optional P1 without claiming it is removed from the roadmap. Do not spend the final day wiring an API at the expense of a working submitted game.

---

## 12. Competition submission deliverables (P0)

The entrant must satisfy eligibility and membership. Prepare a `docs/submission/checklist.md` containing manual confirmation fields for Devpost registration, Developer Access, and Meta VR Start membership. **Never claim these are completed without owner confirmation.**

Meta's rules require for IWSDK/WebXR: a publicly accessible hosted application link; a public YouTube or Vimeo gameplay demonstration **under 3 minutes**; a written description covering inspiration, how it was built, future improvements, and target launch date; track/division selection; and availability throughout judging. Verify the current form before final submission.

**Generate these assets in the repo:**
1. `README.md` — project setup, build, test, controls, XR limitations, optional agent mode.
2. `docs/architecture.md` — actual implemented geometry and planner architecture plus dependency diagram.
3. `docs/QA-report.md` — passed/failed test results and named unverified Quest items.
4. `docs/submission/devpost-description.md` — concise, truthful, compelling pitch; how it works; technical implementation; agentic behavior; originality framing; future plans; proposed launch date as owner's decision.
5. `docs/submission/reviewer-instructions.md` — 30-second launch and hand-input guidance, offline mode expectation, how to reproduce both levels.
6. `docs/submission/video-script.md` and `video-shot-list.md` — **~2:20–2:45** maximum recommended running time, opening with the distinctive two-perspective interaction; show successful Level 1 and authentic LUMA failure/replan from Level 2; identify the agent as a local search-and-validation planner; end with visual payoff. Only capture from the real running application or supported emulator.
7. `docs/submission/screenshots/` — images captured from the functioning application, not conceptual/AI-generated art masquerading as gameplay.
8. `docs/submission/checklist.md` — status, owner actions, hosting, video URL, deadline, rights/licensing and build hash.
9. Stable production build directory and deployment instructions for GitHub Pages or a free HTTPS host. Do not assume a vendor account is connected.

Official competition rules: https://start-developer-competition-26.devpost.com/rules

---

## 13. How to execute the build: autonomous implementation loop

Perform these stages in order, making real changes and proving each stage before continuing:

**Stage A — Inspect and bootstrap**
- Read project files, available tools, SDK docs, and environment. If no app exists, scaffold officially. Write an initial implementation checklist with P0/P1 tags and risk register.
- Start development server and use browser/IWER tools to verify one rendered spatial object with selectable input.
- Fix dependency/version problems before adding gameplay.

**Stage B — Interaction and geometry vertical slice**
- Build front-plane pointer/hand drawing, smooth lines, filled masks, live preview.
- Build side-plane agent visualization and deterministic intersection.
- Implement visible instanced voxels, preview revisioning, worker validation, and core tests.
- Capture screenshot/video evidence and list what genuinely works.

**Stage C — First complete level**
- Build creature, gap, on-rails onboarding, LUMA candidate search, verified traversal and success sequence.
- Run unit/integration/E2E tests. Fix critical defects immediately. Test replay with different human silhouettes.

**Stage D — Essential agentic level**
- Build Level 2 initial constraint and real diagnosis/replanning path. Confirm agent never edits the player's mask.
- Add diagnostic tool logs, understandable glows, robust invalid-input recovery.
- Test at least three player-edit variations and one adversarial input.

**Stage E — Polish and release**
- Improve visuals/audio/accessibility, run latest tests, validate desktop/IWER, test production output, and package submission materials.
- Branch to P1 **only if** the judged P0 path is stable; otherwise explicitly document P1 implementation plan without misrepresenting status.
- Prepare the final real gameplay capture and owner's manual Devpost action list.

### End-of-stage report format (short, factual)
At each stage provide:
- **Changed:** actual files/features implemented.
- **Commands executed:** installation/build/test/runtime commands, with results.
- **Observed:** screenshots or test logs where available; name any emulator or device assumptions.
- **Acceptance:** pass/fail for relevant gates.
- **Next:** immediate implementation step and remaining blocker.

### Final response requirements
When implementation is complete, provide:
1. Repo root and exact run/build/test commands.
2. Current demo behavior, with what truly works in Levels 1/2/3 and whether Cloud LLM mode is configured.
3. Test summary, known issues, Quest-testing caveat.
4. Public URL/video URL **only if actually deployed/uploaded**; otherwise exact owner actions needed.
5. The locations of Devpost assets and whether the final submission was actually performed.

**Start now:** inspect the existing repository/environment, verify the latest official SDK contracts, build the smallest functioning hand/pointer-drawing scene, and continue toward both mandatory levels. Do not stop after producing a plan.
