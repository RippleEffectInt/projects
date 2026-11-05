# Ripple Effect project workspace

A reviewable first iteration of a simpler project app, built in the Projects Codex cloud environment. The target platform is **Azure Static Web Apps**, with an authenticated server-side API, SharePoint lists and Power Automate approvals.

**This iteration is a demo.** It uses eight fictional records and browser storage. No SharePoint item is created, no flow runs and no approval is sent. There is no live-mode switch. No Azure resource has been provisioned or deployed. Existing Dataverse records remain authoritative until an agreed migration and cutover.

## Run in the Projects cloud environment

Use Node 22 or 24 and npm:

```sh
npm ci
npm run dev
```

The development server listens on port 5173 in this cloud environment. Open it using the environment's browser/preview facilities; this is a development preview, not public hosting. Keep development activity here, as requested.

```sh
npm test                      # domain, persistence and React journeys
npm run build                 # strict TypeScript and Vite production bundle
npm ci --prefix api
npm test --prefix api         # disabled server boundary
npm run test:e2e              # desktop + mobile Chromium journeys
npm run format:check
```

Browser tests use `/usr/bin/chromium` in this environment. Elsewhere, set `CHROMIUM_PATH` to a Chromium executable. CI installs Playwright Chromium and uses it automatically. Tests require no Azure or Microsoft credentials. GitHub Actions validates changes but contains **no deployment job**.

## Explore

- Search names, codes, summaries and countries; combine country, stage and Project/CAST filters. Switch between list and cards and sort by code, name or budget.
- Open a project for its next action, stage, planned figures, document links, related CAST record and activity.
- Create a fictional Project or CAST, or edit an example. Project codes and record types stay fixed after creation. Pending examples cannot be edited.
- Prepare Outline, Design or CAST previews where stage and status permit. Design requires three provisional confirmations, one duration choice and comments. Review before saving.
- Saved previews retain their project version. They never change a project stage or approval status. Duplicate previews for the same project version are rejected.
- Changes persist in this browser. Reset restores the fictional examples. Storage problems produce visible recovery messages; data is not silently discarded. Clearing browser data also removes edits.

Budgets use **GBP as a demo assumption**, not a validated production currency mapping. Country codes use demo ISO values and need verification against the flow schema. Planned participant totals exclude CAST but include every project stage, including Closed; they are illustrative sums, not a deduplicated impact measure. The five displayed stages and four approval statuses are a deliberately small UI vocabulary, not the full source schema.

## Repository layout

| Location                          | Purpose                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `src/domain`                      | Typed project model, validation, eligibility and preview construction |
| `src/data`                        | Fictional fixtures and replaceable `ProjectRepository` boundary       |
| `src/components`                  | Project forms, details and approval preview dialogs                   |
| `src/App.tsx`                     | Workspace navigation and browser state                                |
| `api`                             | Azure Functions v4 scaffold; all project operations return HTTP 503   |
| `public/staticwebapp.config.json` | SPA fallback and security headers, copied into `dist`                 |
| `e2e`                             | Desktop and mobile browser journeys                                   |
| `docs`                            | Architecture, contracts, source limitations and integration plan      |

React 19, TypeScript and Vite keep the static frontend small and familiar. Native dialog elements provide modal focus containment and Escape handling. Icons are bundled locally; the app loads no remote fonts, analytics or images.

See [architecture and configuration](docs/architecture.md), [approval contracts and uncertainties](docs/approval-contracts.md), [migration plan](docs/integration-plan.md) and [validation record](docs/validation.md).
