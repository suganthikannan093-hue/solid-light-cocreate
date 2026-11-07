# Narrated gameplay demo
The canonical narration is `narration.json`; measured local speech timings are in `voiceover-timing.json`. The final capture timeline records actual scene durations and planner results. Voice: OpenAI marin, an AI-generated conversational voice, separate from LUMA's original game motifs.

Show the moving closed-loop example, a real first drawing and traveler crossing, the authentic missing-span failure and human repair, recovery/accessibility controls, canopy failure and repair, then budget failure and trim. End on the actual completed structure. No fabricated geometry, planner state or headset footage. Default capture uses no cloud inference.

`node scripts/record-demo.mjs` records real pointer gameplay from the production preview. `python3 scripts/render-demo.py` adds narration, recorded game audio and synchronized captions, produces H.264/AAC MP4 and enforces the three-minute maximum. Intermediate tools/audio stay in ignored `.tmp/`. Public YouTube/Vimeo upload remains an owner action.

Narration revision: the system voice was replaced with OpenAI marin using a conversational script and restrained delivery instructions, following https://developers.openai.com/api/docs/guides/text-to-speech . `node scripts/create-natural-voiceover.mjs <private-key-file>` generates cached speech segments outside source control. The renderer preserves pitch at 0.92× pace, adds short scene-specific pauses and regenerates captions. This remains clearly disclosed AI-generated narration. Gameplay footage and game audio are unchanged.
