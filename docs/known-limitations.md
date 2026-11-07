# Known limitations / open release gates
- Physical Quest is unavailable. Input reliability, text legibility, comfort, thermal behavior and target ≥60 FPS on Quest 3/3S are unverified.
- No public HTTPS deployment, gameplay video upload, or Devpost submission has occurred.
- Level 3 and secure optional Cloud LLM are retained P1 and disabled until P0 release gates pass.
- Local planner uses a finite family of side profiles, not arbitrary synthesis or an LLM. Some unusual but theoretically solvable outlines may receive a redraw request.
- Rigid bank-anchored light decks use a discrete validator, not material stress simulation. Creature footprint is three X cells and five Z cells, with six cells of headroom.
- A new contour replaces the mask; additive editing is not implemented. Undo restores previous complete masks.
- Offline gameplay means no inference/network dependency after initial assets load; cold offline installation/caching is not implemented.
- Gaze-only navigation, voice input, passthrough, multiplayer and persistence are not implemented.
- Official SDK release candidate and transitive dependency audit require continued monitoring; see dependency-audit.json.
