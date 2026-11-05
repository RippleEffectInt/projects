import { approvalKind, countryCodes, makePreview, validateProject } from '../domain/projects';
import type { Checklist, Project, ProjectInput, RequestPreview } from '../domain/projects';
import { seedProjects } from './seed';
export interface Snapshot {
  schema: 1;
  projects: Project[];
  previews: RequestPreview[];
}
/** Replace this boundary with an authenticated same-origin API client at integration time. */
export interface ProjectRepository {
  load(): Snapshot;
  create(input: ProjectInput): Snapshot;
  update(id: string, expectedVersion: number, input: ProjectInput): Snapshot;
  savePreview(id: string, expectedVersion: number, checklist: Checklist): Snapshot;
  reset(): Snapshot;
}
const key = 'ripple-projects-demo-v1';
export class DemoRepository implements ProjectRepository {
  constructor(private storage: Storage = localStorage) {}
  load(): Snapshot {
    let raw: string | null;
    try {
      raw = this.storage.getItem(key);
    } catch {
      throw new Error('Browser storage is unavailable. Enable storage to use this demo.');
    }
    if (!raw) return { schema: 1, projects: seedProjects(), previews: [] };
    try {
      const value = JSON.parse(raw) as Snapshot;
      if (value.schema !== 1 || !Array.isArray(value.projects) || !Array.isArray(value.previews))
        throw new Error();
      // Browser storage is untrusted. Reject unknown or incomplete shapes before rendering.
      if (
        value.projects.some(
          (p) =>
            !p ||
            typeof p.id !== 'string' ||
            !Number.isSafeInteger(p.version) ||
            p.version < 1 ||
            typeof p.code !== 'string' ||
            typeof p.name !== 'string' ||
            typeof p.summary !== 'string' ||
            !Array.isArray(p.documents) ||
            !Array.isArray(p.history) ||
            p.documents.some(
              (d) => !d || typeof d.label !== 'string' || typeof d.url !== 'string',
            ) ||
            validateProject(p, [], p.id).length ||
            p.countryCode !== countryCodes[p.country] ||
            ![
              'Project Outline',
              'Project Design',
              'Seeking Lead Funding',
              'Active',
              'Closed',
            ].includes(p.stage) ||
            !['Waiting Submission', 'Pending Thematic Approval', 'Approved', 'Rejected'].includes(
              p.approvalStatus,
            ) ||
            typeof p.designStatus !== 'string' ||
            p.history.some(
              (h) =>
                !h ||
                typeof h.id !== 'string' ||
                typeof h.at !== 'string' ||
                Number.isNaN(Date.parse(h.at)) ||
                typeof h.title !== 'string' ||
                typeof h.detail !== 'string' ||
                h.source !== 'demo',
            ),
        )
      )
        throw new Error();
      if (
        new Set(value.projects.map((p) => p.id)).size !== value.projects.length ||
        new Set(value.projects.map((p) => p.code)).size !== value.projects.length
      )
        throw new Error();
      if (
        value.previews.some(
          (r) =>
            !r ||
            typeof r.id !== 'string' ||
            typeof r.createdAt !== 'string' ||
            Number.isNaN(Date.parse(r.createdAt)) ||
            !Number.isSafeInteger(r.projectVersion) ||
            !['Outline', 'Design', 'CAST'].includes(r.kind) ||
            r.status !== 'Preview only — not submitted' ||
            !value.projects.some((p) => p.id === r.projectId) ||
            !r.payload ||
            typeof r.payload !== 'object' ||
            Object.values(r.payload).some((v) => typeof v !== 'string') ||
            !r.checklist ||
            typeof r.checklist.comments !== 'string',
        )
      )
        throw new Error();
      return value;
    } catch {
      throw new Error(
        'Saved demo data could not be read. Reset the demo to restore the fictional examples.',
      );
    }
  }
  private persist(state: Snapshot): Snapshot {
    try {
      this.storage.setItem(key, JSON.stringify(state));
    } catch {
      throw new Error('Could not save demo changes. Browser storage may be full or unavailable.');
    }
    return state;
  }
  create(input: ProjectInput): Snapshot {
    const state = this.load();
    const errors = validateProject(input, state.projects);
    if (errors.length) throw new Error(errors.join(' '));
    const project: Project = {
      ...input,
      name: input.name.trim(),
      summary: input.summary.trim(),
      id: crypto.randomUUID(),
      version: 1,
      countryCode: countryCodes[input.country],
      stage: 'Project Outline',
      approvalStatus: 'Waiting Submission',
      designStatus: 'Not started',
      history: [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          title: 'Demo project created',
          detail: 'Saved in this browser only.',
          source: 'demo',
        },
      ],
    };
    return this.persist({ ...state, projects: [project, ...state.projects] });
  }
  update(id: string, expectedVersion: number, input: ProjectInput): Snapshot {
    const state = this.load();
    const p = this.current(state, id, expectedVersion);
    if (input.code !== p.code || input.recordType !== p.recordType)
      throw new Error('Project code and record type are stable after creation.');
    if (p.approvalStatus === 'Pending Thematic Approval')
      throw new Error('This example has an approval pending. Editing is locked until feedback.');
    const errors = validateProject(input, state.projects, id);
    if (errors.length) throw new Error(errors.join(' '));
    const updated = {
      ...p,
      ...input,
      name: input.name.trim(),
      summary: input.summary.trim(),
      countryCode: countryCodes[input.country],
      version: p.version + 1,
      history: [
        ...p.history,
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          title: 'Demo project updated',
          detail: 'Saved in this browser only. Earlier previews refer to their original version.',
          source: 'demo' as const,
        },
      ],
    };
    return this.persist({
      ...state,
      projects: state.projects.map((item) => (item.id === id ? updated : item)),
    });
  }
  savePreview(id: string, expectedVersion: number, checklist: Checklist): Snapshot {
    const state = this.load();
    const p = this.current(state, id, expectedVersion);
    if (
      state.previews.some(
        (r) =>
          r.projectId === id && r.projectVersion === expectedVersion && r.kind === approvalKind(p),
      )
    )
      throw new Error(
        'A preview is already saved for this project version. Find it in approval history.',
      );
    const preview = makePreview(p, checklist);
    return this.persist({
      ...state,
      previews: [preview, ...state.previews],
      projects: state.projects.map((item) =>
        item.id === id
          ? {
              ...item,
              history: [
                ...item.history,
                {
                  id: preview.id,
                  at: preview.createdAt,
                  title: `${preview.kind} preview saved`,
                  detail:
                    'Preview only. No SharePoint item created, no flow triggered and no approval sent.',
                  source: 'demo',
                },
              ],
            }
          : item,
      ),
    });
  }
  private current(state: Snapshot, id: string, version: number): Project {
    const p = state.projects.find((item) => item.id === id);
    if (!p) throw new Error('Project no longer exists. Refresh the workspace.');
    if (p.version !== version)
      throw new Error('This project changed in another tab. Refresh the workspace before saving.');
    return p;
  }
  reset(): Snapshot {
    try {
      this.storage.removeItem(key);
    } catch {
      throw new Error('Browser storage is unavailable.');
    }
    return this.load();
  }
}
