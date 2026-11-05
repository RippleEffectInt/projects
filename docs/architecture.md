# Architecture and configuration

## Implemented now

```text
React workspace → ProjectRepository interface → DemoRepository → browser localStorage

Azure Functions scaffold → unconditional 503 INTEGRATION_NOT_CONFIGURED
                           (not called by the demo)
```

The browser contains fictional examples only and no credentials, tenant IDs, list IDs, flow URLs or real identities. The server scaffold imports no Microsoft client and has no environment variable that can enable live writes. Its route is `/api/projects/{*path}`. It returns a generic 503 for supported read and mutation methods. Its Functions `anonymous` setting allows that error response only; it is not an authentication implementation.

Browser checks improve the demonstration; they are not an authorization boundary. Browser storage offers best-effort version conflict detection and duplicate checks, not atomic multi-user persistence. An open form captures the version when opened and refuses a stale save. Cross-tab storage events refresh the workspace. It is still possible for independent tabs to race a read/write, so production requires server enforcement.

## Intended integrated path — not implemented

```text
Browser → same-origin /api → validated Entra identity
                          → country/record/action authorization
                          → server validation + version/ETag checks
                          → SharePoint project repository
                          → durable idempotent approval request/outbox
                          → isolated Power Automate flow
```

Use Entra sign-in for the intended tenant and enforce authentication on both the SWA route and the API. An API must not trust a browser-supplied user, role or arbitrary identity header. Validate the platform principal and deployment boundary; if a separate Functions host can be called directly, secure that host too. Return 401 for no identity and 403 for insufficient scope. Check country access on every read, write, relationship and approval action, using the verified AccessControl schema and server-side identity IDs. A UI filter is not access control.

The server must re-read stage/status and validate the complete mapped production checklist, resolve intended approvers/substitutes, and enforce optimistic concurrency. Use a durable unique idempotency key (project GUID + stage + project version + request kind) and a request ledger/outbox with recovery for partial writes. Define one active request per project/stage. SharePoint writes across lists are not a transaction; project and request updates need explicit retry/reconciliation semantics. Use ETags/If-Match and return 409 on conflicts; blind overwrite is unacceptable.

The API owns Microsoft Graph/SharePoint credentials using a managed identity or other approved server identity with least privilege on isolated test resources. Only public UI configuration may be browser-visible. No client secret, flow trigger URL, access token or connection string may use a Vite `VITE_` variable. There are no browser environment variables in this iteration.

## Azure Static Web Apps preparation

No Azure resource exists yet and none has been created here. `npm run build` emits `dist`, including `staticwebapp.config.json`. Proposed deployment settings once separately authorized:

| Setting         | Proposed value / requirement                                                              |
| --------------- | ----------------------------------------------------------------------------------------- |
| App location    | `/`                                                                                       |
| Output location | `dist`                                                                                    |
| API location    | `api` (currently disabled scaffold only)                                                  |
| Frontend build  | `npm ci && npm run build`                                                                 |
| Runtime         | Node 22; Functions v4 scaffold                                                            |
| Identity        | Tenant-specific Entra configuration, consent and roles to be agreed                       |
| API settings    | Server only; isolated site/list mappings and identity configuration still to be specified |
| Publication     | No deployment workflow until the Azure resource and review are ready                      |

The current SWA config permits the fictional demo without sign-in. Do not treat it as a production access policy. Before using real data, restrict `/*` and `/api/*` to the agreed authenticated roles, configure 401 handling, and verify direct API access, denied-role cases and cross-country access. Check the selected SWA plan supports the required custom Entra configuration. Verify the wildcard Functions route and SWA auth in an actual test deployment; only the disabled response function is runtime-tested here.

The CSP limits connections to the same origin and prohibits embedded frames and objects. Keep API calls same-origin or deliberately review the CSP when an integration changes it. The Vite development preview does not apply Azure platform headers or authentication; validate those on Azure later.
