# SOLID LIGHT: CO-CREATE
Two minds. Two perspectives. One impossible creation.

Repository: https://github.com/suganthikannan093-hue/solid-light-cocreate

A local construction agent and a human each own one perpendicular silhouette. Their intersection creates a real voxel bridge for a tiny traveler. LUMA is a bounded deterministic search-and-validation planner, not an LLM.

## Positioning
Competition track: **Gaming**, with a **Best First Five Minutes** opening. Minutes 0–5 teach the loop on *The First Bridge*, then stage the authored *Incomplete Span* beat: LUMA’s solid visibly falls short, you repair the missing length with your hands, and the traveler crosses under a celebratory payoff. See [docs/JUDGE-GUIDE.md](docs/JUDGE-GUIDE.md).

LUMA is a **deterministic local search planner**, not an LLM. It searches a fixed budget of candidate side profiles, scores walkability, clearance, shelter and cost, and either commits a solid or asks you to edit what it cannot change (it cannot see intent, and it cannot invent missing length). Open **How LUMA thinks** in the game to inspect the last decision.

Progress (completed chapters, current chapter, Workshop unlocks, fewest-stroke records, comfort/audio settings) is saved in the browser. Returning players choose **Continue** or **New game**. In a headset, lean or look around to inspect real depth; on desktop, right-drag to orbit.


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
Hold the mouse button (or pinch in an immersive session), loop around the thick dotted guide, return to the start and release. A moving example teaches the motion; open loops retain their stroke and show the closing gap. In Levels 1, 2 and 4, a new outline replaces the mask. In the Garden, each closed loop adds light: draw the thin path, then a separate roof loop. Undo restores earlier work; Clear starts again.

Next, Undo, Clear, Help, Enter XR and Settings are the primary actions. A visible Sound on/off control and volume slider sit in the control bar; Help repeats voice guidance. Settings contains chapter practice, Reset, Pause, Recenter, Preview XR, Passthrough, Reduced motion, High contrast and Sturdy/Efficient. Selected and toggle states are visible. Immersive sessions use large spatial controls above the scene's lower edge and a desktop banner while a session is active. Physical Quest validation remains open.

## Journey
Four default chapters: First Bridge teaches the loop; Incomplete Span is the failure → human repair → success beat (LUMA’s first solid falls short; only your hands can add the missing length); Light Garden adds a protective canopy; Last Spark adds a strict voxel budget. After Last Spark, a visible Workshop lists four remixes that change span, creature footprint and resources, with per-chapter best-stroke stars kept in your save. Success requires a real validated route and traveler crossing. An already sufficient drawing can succeed directly.

Live demo: https://suganthikannan093-hue.github.io/solid-light-cocreate/ . On a desktop browser without a headset, Enter XR is the highlighted primary action and Preview XR sits beside it. Preview XR reloads with `?emulate` to install the official IWER Quest 3 runtime, after which Enter XR starts the immersive preview. The four-chapter build passed six hosted browser scenarios and the official four-chapter emulator hand journey. Optional OpenAI/Vultr adapters use a separate secret-holding HTTPS backend and explicit consent. OpenAI is the default provider; its key connectivity has been tested, but a public inference proxy is not deployed. No key belongs in this frontend. See docs/optional-cloud.md.

## Engineering
32³ occupancy V(x,y,z)=F(x,y)&S(z,y); even-odd rasterization, exposed instanced cubes, worker candidate search, bank-anchored rigid-deck walkability BFS, revision guards. World units are meters. See docs/architecture.md and docs/implementation-status.md.

Deployment: docs/deployment.md. Submission drafts: docs/submission/. The master specification is preserved at docs/master-specification.md.

Original procedural art and synthesized sounds. SDK scaffold and dependencies retain their upstream licenses. See docs/submission/checklist.md for owner rights and eligibility confirmations.

Narrated gameplay demo: [162-second MP4](docs/submission/recordings/solid-light-cocreate-narrated.mp4), with captions and recorded game audio. This is real desktop gameplay with AI-generated conversational narration, not physical headset footage.

### Game audio
LUMA has bundled spoken chapter introductions, edit requests, crossing cues and a finale. An original ambient score loops beneath play and softens while LUMA speaks. No speech service, API key or microphone is used during gameplay. Audio starts after the first player interaction; select Help to hear the chapter guidance again. Settings → Mute silences voice, music and effects together. Pause and backgrounding suspend the mix. Voice and music work offline after their initial load.

Audio source/provenance: `src/game/audio/credits.json`. The original score and locally synthesized Samantha voice assets are generated by `scripts/create-game-audio.py` (macOS and the project's existing FFmpeg binary). Browser audio evidence is in `docs/evidence/audio-qa.json`; physical Quest speaker output remains unverified.
