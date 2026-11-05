# Approval contracts and evidence limits

This record is based on the **source analysis supplied in the task handoff**, not independent inspection of the original ZIPs. Those files are unavailable in this cloud environment. No flow has been run or verified at runtime here. Distinguish the contracts reported below from the proposed demo model and future production mapping.

## Outline and Design: reported new-flow inputs

Both trigger when an item is **created** in `Approval Project Outline` and look up the Dataverse project by project code with top 1. Preserve the project GUID and enforce unique project codes during migration; top 1 is not uniqueness validation.

| SharePoint field | Meaning                                        | Demo mapping                              |
| ---------------- | ---------------------------------------------- | ----------------------------------------- |
| `Title`          | Project Code                                   | `project.code`                            |
| `ProjectName`    | Separate project name                          | `project.name`                            |
| `Country`        | Country                                        | Demo country label                        |
| `CountryCode`    | Country code                                   | Demo ISO code; verify actual values/types |
| `FlowCode`       | **String** `"1"` for Outline; `"2"` for Design | String literal, never numeric             |

These five fields are shown in the saved contract preview. Exact internal names, remaining required fields, person fields, comment/checklist field mappings, choice values and environment references need verification. Comments and checklist answers are retained as local preview metadata only. This app does not submit even these five fields.

## Outline

- Combined thematic/M&E response after consultation, then country director card in the country channel.
- Submission enters Pending Thematic Approval in the reported flow.
- Approval results in Project Status `Project Design`, Design Status `In Design`, Approval Status `Waiting Submission`.
- Rejection sets `Rejected`.
- Main cards time out after 30 days. Reported timeout branches restore `Waiting Submission` and record the timeout.

## Design

- Provisional demo UI requires thematic, M&E and budget confirmations, one exclusive duration choice and submission comments.
- The source app's full exact checklist, duration thresholds/semantics and CD comment field mapping need source mapping. The demo's two duration values and three checks do not establish complete production validation.
- The newer thematic Teams card asks for two days of M&E/Finance/Comms feedback. No enforced two-day delay was found in the supplied static analysis.
- This is not the older sequential Thematic → Finance → Africa Director → Director of FR chain.
- Approval results in `Seeking Lead Funding` / `Fully Designed` / `Approved`.
- Rejection results in `Project Design` / `In Design` / `Rejected`.
- Main card timeout records tracking but does not reset the pending project status. This differs from Outline and requires an explicit operational recovery policy.
- Post-approval notifications, document library/folder creation and funding notification records are side effects. The Yes/No process-followed question is not an approval gate.

No status transitions or timeout simulations run in the demo. Its history entries are labelled fictional or preview-only.

## CAST and other processes

CAST uses a separate `CAST Approvals` list. The supplied flow asks the country director for Approved / Resubmit / Take no further and updates Dataverse plus request/history. **The CAST list field schema is unconfirmed.** `Title`, `ProjectName` and `Country` shown in a CAST preview are proposed demo fields, not a verified production contract. No FlowCode is invented for CAST.

Status changes patch the project before writing `App Status Changes`. The included SettoActive flow triggers on string FlowCode `"2"` and logs/notifies without itself changing the project. Do not conflate this FlowCode with Design's different request list. This iteration does not implement status-change submissions.

Substitute requests write `Approvers Holiday Substitute Requests`. The automation that changes approver settings was not supplied. `Africa App Approvers` chooses the main approver when SubStatus is Off and the substitute otherwise. Do not interpret a substitute request as an already-effective approver change. This UI does not manage substitutes.

## Schema still needed

The original Dataverse `cr9a3_projects` table has 88 attributes including system fields. The demo covers only a subset. Preserve stable GUIDs and codes; CAST is a record type in the same table. Map parent, CAST, umbrella and project-manager relationships explicitly. Countrydirectors, Project App Contacts, ProjectsAppHistory and the incomplete PartnerTable1 export need separate review.

Known connected SharePoint list names: AccessControl; Approval Project Outline; CAST Approvals; Africa App Approvers; App Status Changes; Approvers Holiday Substitute Requests; Funding opportunities: Status. Further process tracking and funding notification list names are unestablished. No site, tenant or list identifiers are included here.

Newer flows write SharePoint history, while the original app also has Dataverse ProjectsAppHistory. A transition timeline must reconcile both with source IDs, provenance and duplicate handling; the demo's `source: demo` history is not migrated history.

## Reported review findings to verify in test copies

- Outline adaptive card JSON includes a `//` comment, invalid in strict JSON.
- Country-channel cards do not visibly check responder identity against the intended approver.
- Some person Claims writes use display names; map stable validated identity identifiers instead.
- Design creates a library named Project Name - Project Code but most folder actions target Project Name alone. Both flows create libraries with inconsistent naming.
- Timeout scopes also run for failed/skipped actions; distinguish timeout, failure and non-execution.

These are static review findings, not confirmed runtime failures. Do not copy the issues into new integrations. Test responder identity, strict card JSON, naming, retries, permissions, rejected outcomes and distinct timeout branches before enabling live requests.
