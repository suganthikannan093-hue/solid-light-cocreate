# Performance evidence
Evidence: evidence/performance.json, final conservative-footprint Level 2 in active official IWER Quest 3 emulation on Intel macOS. Not physical Quest.

The hand-created final structure has 900 exposed voxel instances. Emulated stereo scene reported 64 draw calls, 43,260 triangles, 29 geometries and 23 textures. Planner search measured 76.6ms in its worker. 120 animation-frame samples: median 33.1ms, p95 41.8ms. Desktop system load, headed emulator, stereo hand models and window scheduling affect these values. This sample does not meet a 60 FPS desktop-emulator target; it establishes no headset FPS claim.

Candidate compute is bounded to 24 attempts / 800ms plus a 2.5s worker watchdog. Drawing preview is throttled to ~60ms and contour sampling capped at 2048 points. Occupancy is 32KiB, masks 1KiB each; only surface cubes are instanced. Heap peak was not measured; renderer counters are not a heap-memory benchmark.

Target ≥60 FPS on Quest 3/3S remains unverified. Run the physical test script with device/browser version, thermal duration and hand-input notes. Production desktop pointer regression uses Chromium Metal; software-rendered full playthroughs were too slow for the original 60s test budget and are not used as device performance evidence.
