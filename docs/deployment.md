# Production deployment
1. Run `npm ci && npm run typecheck && npm test && npm run build`.
2. `dist/` is the static artifact. Serve locally with `npm run preview -- --host 0.0.0.0` and test asset requests and gameplay.
3. With owner approval, upload all dist contents to a static HTTPS host. For GitHub Pages, put dist contents in the Pages artifact/root, enable Pages via GitHub Actions or a dedicated deployment branch, and retain relative paths. Vite base is `./`, supporting a repository subpath.
4. Verify the actual public HTTPS URL on desktop and Quest Browser: worker URL, asset requests, XR permission, all four chapters offline after loading, reset and session exit. No CORS proxy or provider backend is needed for P0.
5. Keep the host accessible throughout judging. Record final URL, build commit/hash and date in submission/checklist.md. Do not submit a localhost URL.

The local SDK certificate is development-only. A public host must supply a trusted certificate. The owner authorized the public repository and GitHub Pages deployment on 2026-11-07.

## Authorized GitHub deployment
Repository created: https://github.com/suganthikannan093-hue/solid-light-cocreate
Pages site provisioned: https://suganthikannan093-hue.github.io/solid-light-cocreate/
Workflow: .github/workflows/pages.yml. Pushes to main install locked dependencies, typecheck, run unit tests, build and deploy dist through the official Pages artifact actions. GitHub API Pages build_type is workflow. Public gameplay verification status is in evidence/hosted-qa.json when completed.
