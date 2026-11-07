# SOLID LIGHT: CO-CREATE
Two minds. Two perspectives. One impossible creation.

## Inspiration
Visual-hull reconstruction and shadow puzzles make a beautiful promise: two flat perspectives can define something spatial. We explore a cooperative twist. A person owns the front silhouette; LUMA owns the perpendicular side silhouette. Neither can quietly correct the other's work.

## What it does
Draw a ribbon of cyan light. LUMA proposes amber side profiles and tests the resulting voxel structure. A small traveler crosses only when a walkable path exists in that actual solid. In the second puzzle, the human outline stops short. LUMA discovers that no side-view change can supply missing length, highlights the absent columns, and asks the player to extend their drawing. A new human revision triggers a real replan.

## How we built it
TypeScript, Meta IWSDK 1.1.0-rc.2, its ECS and shared spatial pointer input, Vite, Three.js re-exported by IWSDK, and the official IWER emulator. A worker intersects two 32×32 masks into 32³ occupancy, evaluates bounded candidate side projections, and runs BFS over standable surfaces with floor thickness, footprint, step and clearance checks. Exposed voxels render in one instanced mesh. Revision checks prevent old computation replacing current input. Assets are procedural and sounds synthesized.

## What makes LUMA agentic
LUMA observes geometry, proposes candidates, executes construction/validation tools, ranks tested results, commits valid geometry, and requests human edits beyond its authority. It is a deterministic offline search-and-validation planner, not an LLM. Every critical puzzle runs without paid inference or a cloud service.

## Challenges and testing
See ../QA-report.md for executed tests, failures fixed and remaining verification. Desktop/emulator evidence must not be described as physical Quest testing. No hardware FPS claim is made.

## Future improvements
Level 3, The Light Garden, retains two simultaneous constraints and a resource-versus-robustness choice. Optional cloud strategy/explanation would use a secure backend with consent, schema validation and automatic local fallback. Both are currently disabled and not presented as playable.

Target launch date: owner decision, pending hardware and public-host verification.
Suggested track/division: Gaming / New Experience, subject to entrant eligibility and final form confirmation. Special-award focus: Agentic Interaction. This text is a draft, not a submitted entry.
