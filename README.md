# SOLID LIGHT: CO-CREATE
Two minds. Two perspectives. One impossible creation.

Repository: https://github.com/suganthikannan093-hue/solid-light-cocreate

A local construction agent and a human each own one perpendicular silhouette. Their intersection creates a real voxel bridge for a tiny traveler. LUMA is a bounded deterministic search-and-validation planner, not an LLM.

## Run
Requires Node 20.19+ (20), 22.12+ (22), or 24+. Verified environment: Intel macOS, Node 26.13.0. Dependencies are locked; official IWSDK 1.1.0-rc.2 scaffold.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

The SDK starts a managed Chromium window at https://localhost:8081 and its official IWER Quest 3 emulator. A local development certificate warning is expected. For automated browser QA:

```sh
npx @iwsdk/cli dev restart --open --allow-browser-automation
npx @iwsdk/cli browser run scripts/desktop-qa.mjs --timeout 60000
```

## Controls
Drag a closed outline around the dotted front-plane guide; release to fill and ask LUMA to plan. Drawing again replaces the current silhouette; Undo restores the previous one. Desktop buttons and spatial buttons provide Level 1/2, Undo, Clear, Reset, Pause/Resume, Recenter, Help, Enter XR, Mute, Reduced motion, and High contrast. Pinch-and-drag uses IWSDK's shared spatial pointer path. An immersive session hides ordinary browser UI; use the spatial controls below the bridge. Hand input and hardware test status are in docs/QA-report.md.

Level 1: trace the full guide. Level 2: first trace the short guide; LUMA evaluates candidates and highlights missing columns. Redraw the ribbon extending through those columns to the far bank. An already sufficient drawing may succeed directly. Invalid input gives guidance, never a fabricated bridge.

## Scope
Levels 1 and 2 are the default submission path. Experimental Level 3 is available with `?level3=1`: select Level 3, build a path and canopy, and compare Sturdy / Efficient designs. It has desktop and IWER hand evidence. Optional cloud adapters support Vultr (default) or OpenAI behind a separately configured HTTPS backend; no cloud backend/key or paid calls are active. See docs/level3.md and docs/optional-cloud.md. Passthrough disabled. Public demo: https://suganthikannan093-hue.github.io/solid-light-cocreate/ . No public video upload has occurred. Quest performance and physical hand reliability require hardware testing.

## Engineering
32³ occupancy V(x,y,z)=F(x,y)&S(z,y); even-odd rasterization, exposed instanced cubes, worker candidate search, bank-anchored rigid-deck walkability BFS, revision guards. World units are meters. See docs/architecture.md and docs/implementation-status.md.

Deployment: docs/deployment.md. Submission drafts: docs/submission/. The master specification is preserved at docs/master-specification.md.

Original procedural art and synthesized sounds. SDK scaffold and dependencies retain their upstream licenses. See docs/submission/checklist.md for owner rights and eligibility confirmations.
