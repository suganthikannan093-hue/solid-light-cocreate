# Implementation status
Source of truth: master-specification.md. Target: accelerated single-day delivery; acceptance gates remain mandatory.

| Milestone | Dependencies | Acceptance | Status |
|---|---|---|---|
| A P0 environment/input | official generator, SDK | rendered selectable drawing surface, desktop/IWER evidence | passed locally |
| B P0 geometry | A | 32³ intersection, exposed instances, rasterization and validation tests, worker revision guard | passed locally |
| C P0 Level 1 | B | user drawing → bounded candidate search → validated creature crossing | desktop / IWER hands passed |
| D P0 Level 2 | C | genuine missing-X failure → human request → edit → replan → crossing | desktop / IWER hands passed |
| E P0 release | C,D | accessibility, browser/emulator QA, production build, accurate submission pack, public HTTPS gate | public P0 passed; final P1 deployment regression pending |
| F P1 Level 3 | stable P0 | second independent constraint and strategic choice, gated | experimental: unit / desktop / IWER hand passed |
| G P1 Cloud | stable P0 | secure backend, consent, schema/timeout/rate-limit fallback | implemented and mock/fallback tested; live service unconfigured |

## Risks and decisions
- No Quest available: all hardware hand reliability, comfort and ≥60 FPS remain unverified.
- Fresh official SDK is 1.1.0-rc.2: pin exact versions and use installed contracts.
- Managed Chromium installation/runtime may need recovery; never replace actual emulator evidence with synthetic events.
- Owner authorized a new GitHub repository/public hosting on 2026-11-07. GitHub connector identity is suganthikannan093-hue; connector has no repository-create tool and local gh is unauthenticated. Private credential card requested; no token is stored in source. Public HTTPS gate remains open until deployment is actually verified.
- World meters; normalized mask Y increases upward; front F(x,y), side S(z,y); occupancy is their logical intersection.
- Structural game rule: anchored rigid light deck, minimum 2-cell thickness, 3×5-cell creature footprint, 6-cell headroom, at most 1-cell step. It is a puzzle validator, not a general rigid-body solver.
- Even-odd polygon fill deterministically handles crossings; tiny/empty input rejected.
- P0 release gate precedes P1 work, regardless of the accelerated schedule.

## Environment
2026-11-07: Intel x86_64 macOS 26.7.2, Node 26.13.0, npm 11.20.0, git 2.50.1, RAM 16 GiB, free disk ~881 GiB. Safari installed; SDK-managed Chromium to be verified. Existing handflow and small-company left untouched.

## Evidence
13 unit tests passed. Production full pointer playthrough passed offline after initial load, including both levels, recovery, resize and refresh. Both final conservative-footprint levels passed official IWER hand input. Actual worker rapid-clear race passed. Real screenshots and unedited production gameplay recording retained. Final layout-only production regression passed.

P1 implemented only after hosted P0 passed. Experimental Garden tests both path and canopy, actual path shelter, and sturdy/efficient costs. IWER hand drawing/crossing passed. Cloud supports Vultr/OpenAI with server-only keys, consent, schema/time/request guards and offline fallback. Native browser fetch binding defect was fixed; all three local production scenarios passed, then final Garden clone ownership fix passed its targeted rerun. Vultr activation remains blocked on fixed backend egress IP/subnet allowlisting, owner configuration and credit terms.
