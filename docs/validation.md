# Validation record

Verified in the Projects Codex cloud environment on 5 November 2026. All source, dependency installation, builds and browser checks took place here. No Azure deployment or production writes were performed.

| Check                   | Result                                                   |
| ----------------------- | -------------------------------------------------------- |
| `npm test`              | 25 passing domain, persistence and React journey tests   |
| `npm run build`         | Strict TypeScript check and Vite production build passed |
| `npm test --prefix api` | 1 passing test of the unconditional 503 response         |
| `npm run test:e2e`      | 14 passing desktop/mobile Chromium checks                |
| `npm run format:check`  | Passed                                                   |

Browser coverage includes automatic XX/MC code derivation from existing form values, one global sequence across countries, read-only project codes, create/edit/reload/reset, search and combined filters, card view, Outline contract preview, Design readiness and exclusive duration choice, native-dialog Escape, pending-record locks, cross-tab stale edits, keyboard tab navigation, and viewport bounds. Mobile uses Android/Pixel Chromium emulation. The default narrow-screen view uses project cards.

Automated axe checks found no WCAG A/AA violations on the checked portfolio, project detail, create-project dialog, Design dialog, getting-started and approval workspace screens at the tested desktop and mobile sizes. Text contrast and keyboard access were improved during validation. This is an automated check, not a complete accessibility certification, screen-reader review or real-device test.

The only API behavior tested is the disabled response function. The Azure Functions host, wildcard route, SWA security headers/identity, Entra authorization, SharePoint permissions/schema, Power Automate outcomes, retries, timeouts, migration and production access have **not** been runtime-verified. Their tests require an authorized isolated Azure/Microsoft environment.

The source ZIPs were not available here. Approval documentation records findings supplied in the handoff and marks remaining schema uncertainties. No claim of independent source inspection or live workflow verification is made.

Expanded project fields are checked for independent participant counts (including zero versus unknown), actual-date validity, invalid/self/cyclic relationships, persistence, earlier-value snapshots and protection of process-managed statuses during ordinary edits. Browser journeys verify edit/reload and read-only earlier values on desktop and mobile.
