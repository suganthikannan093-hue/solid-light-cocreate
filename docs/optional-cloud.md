# Optional cloud mode — implemented, not configured or live-provider tested
The submitted default remains offline. No paid request has been made. No Vultr/OpenAI key or cloud backend is deployed to GitHub Pages.

CloudStrategyProvider implements consent, HTTPS-only endpoint configuration, strict two-field schema validation, a 1.2s client timeout, a three-request session cap, and automatic local fallback for invalid JSON, invalid schema, missing config, HTTP/rate-limit failure, lost network or timeout. Suggestions only choose sturdy/efficient strategy and a short explanation. In the application, the local worker builds and validates all geometry; cloud output cannot write masks or assert success.

`server/cloud.mjs` is a separate Node backend for Vultr Serverless Inference (default) or the OpenAI Responses API, using the verified structured `text.format` JSON-schema contract: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses . It has no tools, `store:false`, an output-token limit, origin allowlist, 4KiB body limit, body timeout, upstream timeout, output revalidation, a six-request/minute cap and a 30-request process lifetime cap. Tests use mocked upstream responses and make no paid calls. A real configured supported-model integration remains unverified.

Owner configuration (server environment only, never VITE_ variables):
- CLOUD_ENABLED=true
- CLOUD_ALLOWED_ORIGIN=https://suganthikannan093-hue.github.io
- CLOUD_PROVIDER=vultr (or openai)
- CLOUD_MODEL=a supported structured-output model chosen from that provider’s live catalog
- VULTR_INFERENCE_API_KEY=owner Vultr inference credential supplied privately to the server
- For CLOUD_PROVIDER=openai instead, use OPENAI_API_KEY
- CLOUD_PORT=8787 (optional)

Run `node server/cloud.mjs` behind a trusted HTTPS reverse proxy with `/strategy` exposed. The server binds loopback. Set provider spending limits and protect the deployment appropriately; a browser Origin allowlist is not user authentication. The explicit process lifetime cap bounds this demonstration backend; production multi-instance usage needs a shared quota/auth layer.

Open the game with `?cloud=` followed by the URL-encoded HTTPS `/strategy` endpoint. The experimental `Enable paid cloud` spatial/desktop button is off initially; the player must explicitly enable it before any request. Then draw normally. Backend/config failures transparently use the offline worker. ChatGPT subscription access is not treated as API credit or a server credential.

Vultr Responses compatibility: https://api.vultrinference.com/docs/reference/create-response . Model-specific structured-output support must be verified with the selected model; invalid/unsupported responses always fall back. The owner identified Agent Rush/hackathon credits. Official event terms: https://lablab.build/ai-hackathons/vultr-hackathon?enroll=true . The page advertises $200 and includes inference in the stack, but promises credit/account access during the event and requires a payment method for continued deployments. Exact coupon applicability to this separate Meta project, remaining balance and expiry are not account-verified. No Vultr resource or billable inference has been activated.

## Vultr source-IP allowlist (owner requirement)
Use a backend with a fixed public outbound address, preferably an existing Vultr VM. In Vultr Dashboard API access controls, allow that backend's actual IPv4 `/32` (or actual IPv6 `/128` if it egresses over IPv6). Do not allow a changing Quest/player address or GitHub Pages; neither should call Vultr directly. If a proxy/NAT is involved, allow its outbound address rather than the VM's private address. Verify the egress address from the backend host before enabling calls.

Use the **Serverless Inference subscription key** for inference, not the general infrastructure-management API key. Vultr documents platform user API subnet restrictions separately: https://docs.vultr.com/support/platform/users/how-can-i-manage-api-access-for-users . Inference authentication: https://api.vultrinference.com/docs/get-started/authentication . Preserve any inference/account restrictions shown in the owner's dashboard.

After the owner verifies the whitelist, set `CLOUD_EGRESS_ALLOWLIST_CONFIRMED=true` on the backend together with `CLOUD_ENABLED=true`. The production server entry point keeps Vultr mode disabled without both flags. No outbound IP or whitelist change has been claimed or made; no backend VM has been provisioned. GitHub Pages continues serving the free offline game independently.
