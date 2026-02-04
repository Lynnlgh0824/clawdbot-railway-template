# BigModel Provider — Onboarding notes

This document explains necessary onboarding adjustments when adding `bigmodel` provider.

1) API key validation
- Original onboarding may expect provider keys like `sk-...` (OpenAI). For `bigmodel`, do not require that prefix.
- Update the server-side validation to skip `sk-` check when `provider.name === 'bigmodel'`.

2) Health check
- Call the provider's `chat` with a minimal prompt (e.g. `ping`) and `max_tokens:1` to verify key and endpoint.
- Use a short timeout (5s) to avoid blocking onboarding.

3) Model whitelist
- Allow `glm-4`, `glm-4-air`, `glm-4-flash`. If your onboarding enforces a model list, add these entries for `bigmodel`.

4) Streaming capability
- If the UI requires streaming support to be present, either:
  - Update the UI to accept providers without streaming, or
  - Implement streaming in `BigModelProvider` (parse SSE/data frames) and expose a `stream` method.

5) Error mapping
- Map HTTP errors (4xx/5xx) to a common shape used by the rest of the system. Example: `{ code, message, provider: 'bigmodel' }`.

6) Configuration
- In configuration UI or `setup` payload, let user select `bigmodel` and supply `BIGMODEL_API_KEY` (or paste key). Persist in config as provider-specific settings.

Example onboarding arg snippet (server side) when building `openclaw onboard` args:

```
--provider bigmodel --provider.apiKey $BIGMODEL_API_KEY --provider.model glm-4
```

If you want, I can patch the onboarding `buildOnboardArgs` in `src/server.js` to include `bigmodel` branching.
