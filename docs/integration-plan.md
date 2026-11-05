# Integration and migration plan

The replacement frontend alone does **not** migrate the application. Existing Outline/Design/CAST flows still read and write Dataverse. Dataverse remains authoritative until an agreed cutover. Do not connect this demo to production request lists.

## 1. Agree the model and access rules

Obtain the actual list schemas, internal field names, choice values, required fields, current flow definitions and full Design checklist. Map every needed Dataverse attribute to SharePoint, including money/currency, participant definitions, planned/actual dates, narrative, documents, approval status/last approval, CAST, parent and umbrella relationships and manager identity. Identify the incomplete partner schema and unknown tracking/funding lists.

Define the source for project stages and transitions. Confirm code uniqueness and GUID retention, currency treatment, country-code values, participant aggregation, approver identity, delegations, holiday substitutions and per-country/action permissions. The demo's GBP, dates, duration choices and status subset are not approved schema definitions.

## 2. Create an isolated integration environment

After separate authorization, provision the Azure Static Web App and its Entra configuration. Create **test-only** SharePoint project/history/request lists and test copies of flows with connections and recipients pointed only at test resources. Disable accidental connections to production. Use fictional data first.

Repoint all Dataverse project lookups/updates in the test flows to the new Projects SharePoint repository and preserve GUID/code links. Include the less visible notification, funding, document and process tracking actions. Merely changing the front end or request list is insufficient.

## 3. Implement the server path

Replace the unconditional 503 scaffold only when authentication, country/record authorization, server-side model validation, ETags, idempotency and audit logging are implemented together. Replace DemoRepository with a same-origin API client. Keep demo and integration modes isolated; never silently fall back to fictional data after a live request fails.

Proposed endpoints (not implemented):

| Endpoint                                    | Responsibility                                                 |
| ------------------------------------------- | -------------------------------------------------------------- |
| `GET /api/projects`                         | Authorized paginated/filterable portfolio                      |
| `POST /api/projects`                        | Validate and create stable GUID + unique code                  |
| `GET /api/projects/{id}`                    | Authorized detail with version/ETag                            |
| `PATCH /api/projects/{id}`                  | If-Match update, immutable identifiers, stage restrictions     |
| `POST /api/projects/{id}/approval-requests` | Current stage validation + durable idempotent request creation |
| `GET /api/projects/{id}/activity`           | Authorized unified timeline with provenance                    |

Choose safe retry/reconciliation semantics for request-list creation and project-state updates. Never report “sent” until the request is durably accepted. Separate submission acceptance, awaiting approval, decision, timeout and operational failure. Record a correlation ID and stable initiating identity, not a display name as authority.

## 4. Verify workflows end to end

In isolated resources, verify Outline and Design created-item triggers, string FlowCodes, unique-code lookups, current project version, responder authorization, combined thematic/M&E handling and country director routing. Verify Design outcomes without reintroducing the old approval chain. Validate CAST separately from the shared Outline/Design list. Test substitutes using confirmed settings and effective dates.

Exercise approve/reject/resubmit/take-no-further, duplicate clicks, retries, races, stale versions, 401/403, cross-country denial, timeouts and failed/skipped actions. Repair strict JSON and identity claims. Use one deterministic library/folder naming rule with stable GUID/code; test illegal characters, renames, existing folders and permission failures. Verify post-approval failures cannot produce a duplicate approval request.

## 5. Rehearse migration and cutover

Inventory, export securely, map and reconcile project counts, GUID/code uniqueness, relationships, historical status/date values, documents and both history sources. Plan deduplication and retain provenance. Resolve CAST and umbrella relationships before switching reads.

Define a freeze/delta procedure, ownership, rollback, reconciliation and the point at which SharePoint becomes authoritative. Avoid uncontrolled dual writes. Disable old production entry points and old flow triggers deliberately at cutover; preserve the ability to inspect the previous system. Validate permissions and real user journeys before approving production activation.

## Acceptance before live mode

Review the complete field mapping, verified flow outcomes, security tests, audit/history reconciliation, retry/duplicate behavior, deployment configuration, operator recovery steps and migration rehearsal. No live deployment, production data import or production write is part of this first iteration.
