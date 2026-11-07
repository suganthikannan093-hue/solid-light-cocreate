# Retained P1 implementation backlog
P0 release gate is open until actual public HTTPS verification and submission evidence/owner review. Do not expose incomplete optional buttons.

## Level 3 — The Light Garden (planned, not playable)
Dependency: stable tested P0. Extend LevelGoal with an independent overhead-shield constraint. Human front projection supplies both a deck and raised canopy band; LUMA chooses matching depth/support profiles. Validate each path cell's headroom and canopy coverage independently against occupancy. Add a visible falling-light setting, two constraint indicators, a sturdy/wide versus efficient strategy switch, finale and replay using existing pointer gestures. Required fixtures: path-only fails shield, shield-only fails path, low roof fails clearance, both pass; both strategies must show a measurable occupied-voxel tradeoff. Then desktop + IWER playthrough and feature flag enablement.

## Optional CloudStrategyProvider (planned, disabled)
Dependency: stable P0. Preserve StrategyProvider and OfflineStrategyProvider. Implement a separately deployed HTTPS backend holding an owner-supplied API credential via a secret mechanism, with JSON schema validation, allowlisted high-level strategy fields, length limits, request cap, timeouts, rate limiting and no model writes to masks. Frontend opt-in consent sends only minimized grid/goal statistics; backend suggestions never override local occupancy validation. Missing config/key, bad JSON, timeout, 429, lost connection and offline mode all automatically select the offline provider. Unit/integration tests must prove each fallback and confirm no credential in dist. No paid call without explicit owner configuration/consent.

## Additional polish
More procedural settings, replay variation, original responsive audio families, first-time unfamiliar human usability session and headset-specific tuning. These must not displace release-blocking fixes.
