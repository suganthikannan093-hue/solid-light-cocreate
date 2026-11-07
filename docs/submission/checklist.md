# Submission checklist
Rules checked 2026-11-07: https://start-developer-competition-26.devpost.com/rules
Deadline shown: November 18, 2026 at noon PST. Build target accelerated to one day; release gates unchanged.

## Owner confirmations (not performed by agent)
- [ ] Devpost registration and entry created
- [ ] Developer Access / Meta developer account eligibility
- [ ] Meta VR Start membership and contest eligibility
- [ ] Gaming / New Experience track/division confirmed against actual form
- [ ] Rights to project/dependencies and required licenses reviewed
- [ ] Submission statements, team details and proposed launch date approved

## Release
- [ ] P0 acceptance gates closed (see QA-report.md)
- [ ] Physical Quest script executed, or limitations accurately disclosed
- [x] Owner approves external deployment (new repository, 2026-11-07)
- [x] Public trusted HTTPS URL: https://suganthikannan093-hue.github.io/solid-light-cocreate/
- [x] Production public URL tested for both P0 levels and asset/worker paths; latest four-chapter hosted rerun pending
- [ ] Hosting maintained throughout judging
- [ ] Real gameplay video under 3 minutes reviewed
- [ ] Owner approves video upload to public YouTube/Vimeo
- [ ] Public video URL: pending
- [ ] Final Devpost form requirements checked
- [ ] Final submission performed by owner

Local artifact: `release/solid-light-cocreate-dist.zip`. Its current SHA256 and per-file hashes are in `release/build-manifest.json`; the scope is four default chapters and workshop presets. GitHub Actions builds its own Linux artifact from the published source.

OpenAI connectivity has been verified separately; no public inference proxy is deployed. The default experience uses local planning. Eligibility, rights, final form statements, public video upload and Devpost submission remain owner actions.
