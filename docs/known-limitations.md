# Known limitations / open release gates
- Physical Quest is unavailable. Input reliability, text legibility, comfort, thermal behavior and target ≥60 FPS on Quest 3/3S are unverified. IWER hand disconnect, seated 1.2 m pose and reported FOV 90° are emulator-only.
- Public GitHub Pages deployment and hosted P0 verification succeeded. No public gameplay video upload or Devpost submission has occurred.
- Four chapters and four workshop presets now form the default local journey. Final updated hosted and emulator regression status is tracked in implementation-status.md. OpenAI connectivity passed a real bounded request; the public cloud proxy is not deployed.
- Local planner uses a finite family of side profiles, not arbitrary synthesis or an LLM. Some unusual but theoretically solvable outlines may receive a redraw request.
- Rigid bank-anchored light decks use a discrete validator, not material stress simulation. Creature footprint is three X cells and five Z cells, with six cells of headroom.
- New contours replace the mask in Levels 1, 2 and 4. Garden loops add to the mask; Undo restores the previous complete mask and Clear removes all loops.
- Offline gameplay means no inference/network dependency after initial assets load; cold offline installation/caching is not implemented.
- Gaze-only navigation, voice input, passthrough, multiplayer and persistence are not implemented.
- Official SDK release candidate and transitive dependency audit require continued monitoring; see dependency-audit.json.
