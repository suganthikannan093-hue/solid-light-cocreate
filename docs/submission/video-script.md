# Narrated gameplay demo
The canonical narration is `narration.json`; measured local speech timings are in `voiceover-timing.json`. The final capture timeline records actual scene durations and planner results. Voice: locally synthesized macOS Samantha, separate from LUMA's original game motifs.

Show the moving closed-loop example, a real first drawing and traveler crossing, the authentic missing-span failure and human repair, recovery/accessibility controls, canopy failure and repair, then budget failure and trim. End on the actual completed structure. No fabricated geometry, planner state or headset footage. Default capture uses no cloud inference.

`node scripts/record-demo.mjs` records real pointer gameplay from the production preview. `python3 scripts/render-demo.py` adds narration, recorded game audio and synchronized captions, produces H.264/AAC MP4 and enforces the three-minute maximum. Intermediate tools/audio stay in ignored `.tmp/`. Public YouTube/Vimeo upload remains an owner action.
