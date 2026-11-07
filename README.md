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
Hold the mouse button (or pinch in an immersive session), loop around the thick dotted guide, return to the start and release. A moving example teaches the motion; open loops retain their stroke and show the closing gap. New outlines replace the mask. Undo restores earlier work.

Next, Undo, Clear, Help and Settings are the primary actions. Settings contains chapter practice, Reset, Pause, Recenter, Enter/Exit XR, Mute, Reduced motion, High contrast and Sturdy/Efficient. Selected and toggle states are visible. Immersive sessions use large spatial controls above the scene's lower edge. Physical Quest validation remains open.

## Journey
Four default chapters: First Bridge teaches the loop; Incomplete Span requires extending the human projection; Light Garden adds a protective canopy; Last Spark adds a strict voxel budget. Next then cycles four workshop presets that change span, creature footprint and resources. Success requires a real validated route and traveler crossing. An already sufficient drawing can succeed directly.

Live demo: https://suganthikannan093-hue.github.io/solid-light-cocreate/ . The four-chapter build passed six hosted browser scenarios and the official four-chapter emulator hand journey. Optional OpenAI/Vultr adapters use a separate secret-holding HTTPS backend and explicit consent. OpenAI is the default provider; its key connectivity has been tested, but a public inference proxy is not deployed. No key belongs in this frontend. See docs/optional-cloud.md.

## Engineering
32³ occupancy V(x,y,z)=F(x,y)&S(z,y); even-odd rasterization, exposed instanced cubes, worker candidate search, bank-anchored rigid-deck walkability BFS, revision guards. World units are meters. See docs/architecture.md and docs/implementation-status.md.

Deployment: docs/deployment.md. Submission drafts: docs/submission/. The master specification is preserved at docs/master-specification.md.

Original procedural art and synthesized sounds. SDK scaffold and dependencies retain their upstream licenses. See docs/submission/checklist.md for owner rights and eligibility confirmations.

Narrated gameplay demo: [159-second MP4](docs/submission/recordings/solid-light-cocreate-narrated.mp4), with captions and recorded game audio. This is real desktop gameplay with synthesized narration, not physical headset footage.
