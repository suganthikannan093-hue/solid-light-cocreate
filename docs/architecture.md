# Implemented architecture
The official generated Vite plugin reads iwsdk.config.json and supplies virtual:iwsdk-project to World.create. Assets are deterministic parentless prototypes shared by runtime/editor. CoCreateSystem is an IWSDK entity-component system (ECS) system; spatial objects use RayInteractable and SDK pointer events. All runtime Three imports come from @iwsdk/core.

```mermaid
flowchart LR
 Input[Mouse / IWSDK hand pointer] --> Stroke[Smooth normalized contour]
 Stroke --> Raster[Even-odd mask rasterization]
 Raster --> Revision[Versioned worker request]
 Revision --> Agent[Bounded offline candidate search]
 Agent --> Volume[32³ front AND side occupancy]
 Volume --> Walk[Surface graph + BFS validation]
 Walk --> Decision[Valid candidate or human edit request]
 Decision --> Renderer[Exposed instanced cubes]
 Decision --> Creature[Verified path traversal]
 Decision --> Human[Missing-column highlight]
```

Front is XY; side is ZY. Each pixel maps to a voxel column. Y increases upward. Grid dimensions 32³, physical cell sizes x=.04, y=.02, z=.02 meters. Volume lower corner is (-.84,.63,-1.87). Rendering and validation read the same occupancy array. Interior voxels are omitted from rendering, occupancy preserved.

Contours: clamp normalized coordinates, smooth samples with EMA .7, spacing .004, cap 2048 points, implicit closure, even-odd fill at pixel centers. Fewer than 6 pixels is rejected as empty. Crossings have deterministic parity semantics.

Planner searches up to 24 candidates with an 800ms worker budget: 3 deck heights, 4 depth widths, 2 thicknesses. Score is 100000 minus occupied voxel count and a 1000-per-cell penalty for distance from a preferred depth derived from the human silhouette’s occupied area/span. Valid drawings of different thickness therefore change LUMA’s depth choice; validity always dominates candidate selection. Invalid score measures reachable surface exploration. Candidate attempts retain width, height, failures and score. No agent function mutates front pixels. Missing X is diagnosed from the human mask itself and highlighted by column. Search is deterministic absent a time-budget exit.

Validation is an intentionally discrete rigid-light puzzle model, not structural engineering simulation. Standable cells require 2-cell floor thickness, a 3×5-cell XZ footprint, 6-cell head clearance, deck height within one cell of the banks, and bank-height endpoints. BFS visits surface cells with at most a 1-cell step. The banks anchor a continuous rigid deck; disconnected floating structures cannot pass. The 0.12×0.10m footprint and 0.12m headroom conservatively enclose the 0.09m traveler.

Worker responses are accepted only at current revision. New input/reset invalidates prior work. 2.5s watchdog terminates/recreates a stuck worker. Traversal is paused on visibility loss. Errors give recoverable guidance. Listeners, textures and worker are registered for teardown. Dynamic geometry is a bounded persistent InstancedMesh.

P1 StrategyProvider is defined; OfflineStrategyProvider is implemented. Cloud must be added behind an HTTPS server, schema validation, explicit consent, request limits and fallback. No frontend key setting exists. Level 3 needs a separately verified environmental constraint; its flag is false.
