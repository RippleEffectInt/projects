import {
  validateProfile,
  validateRelationships,
  documentKinds,
  type ProjectProfile,
  type PreviousValues,
} from './projectProfile';
export const countries = ['Ethiopia', 'Kenya', 'Malawi', 'Rwanda', 'Uganda', 'Zambia'] as const;
export const stages = [
  'Project Outline',
  'Project Design',
  'Seeking Lead Funding',
  'Active',
  'Closed',
] as const;
export type Stage = (typeof stages)[number];
export type ApprovalStatus =
  'Waiting Submission' | 'Pending Thematic Approval' | 'Approved' | 'Rejected';
export type RecordType = 'Project' | 'CAST';
export interface Activity {
  id: string;
  at: string;
  title: string;
  detail: string;
  source: 'demo';
}
export interface DocumentLink {
  label: string;
  url: string;
  kind?: (typeof documentKinds)[number];
}
export interface Project {
  id: string;
  version: number;
  code: string;
  name: string;
  country: (typeof countries)[number];
  countryCode: string;
  recordType: RecordType;
  stage: Stage;
  approvalStatus: ApprovalStatus;
  designStatus: string;
  budget: number;
  participants: number;
  startDate: string;
  endDate: string;
  summary: string;
  documents: DocumentLink[];
  parentId?: string;
  profile?: ProjectProfile;
  previousValues?: PreviousValues;
  multiCountry?: boolean;
  history: Activity[];
}
export type ProjectInput = Pick<
  Project,
  | 'parentId'
  | 'profile'
  | 'multiCountry'
  | 'code'
  | 'name'
  | 'country'
  | 'recordType'
  | 'budget'
  | 'participants'
  | 'startDate'
  | 'endDate'
  | 'summary'
  | 'documents'
>;
export type ApprovalKind = 'Outline' | 'Design' | 'CAST';
export interface Checklist {
  thematic: boolean;
  monitoring: boolean;
  budget: boolean;
  duration: '' | 'up-to-three-years' | 'over-three-years';
  comments: string;
}
export const emptyChecklist: Checklist = {
  thematic: false,
  monitoring: false,
  budget: false,
  duration: '',
  comments: '',
};
export interface RequestPreview {
  id: string;
  projectId: string;
  projectVersion: number;
  kind: ApprovalKind;
  createdAt: string;
  checklist: Checklist;
  payload: Record<string, string>;
  status: 'Preview only — not submitted';
}
export const countryCodes: Record<(typeof countries)[number], string> = {
  Ethiopia: 'ET',
  Kenya: 'KE',
  Malawi: 'MW',
  Rwanda: 'RW',
  Uganda: 'UG',
  Zambia: 'ZM',
};
export function approvalKind(p: Project): ApprovalKind | null {
  if (p.approvalStatus === 'Pending Thematic Approval' || p.approvalStatus === 'Approved')
    return null;
  if (p.recordType === 'CAST') return p.stage === 'Project Outline' ? 'CAST' : null;
  return p.stage === 'Project Outline' ? 'Outline' : p.stage === 'Project Design' ? 'Design' : null;
}
export function validateProject(
  input: ProjectInput,
  projects: Project[],
  ignoreId?: string,
): string[] {
  const errors: string[] = [];
  if (!/^DEMO-[A-Z0-9-]{2,30}$/.test(input.code))
    errors.push('Use a unique demo code starting DEMO- (letters, numbers and hyphens only).');
  if (projects.some((p) => p.id !== ignoreId && p.code.toLowerCase() === input.code.toLowerCase()))
    errors.push('This project code already exists.');
  if (!input.name.trim() || input.name.length > 160)
    errors.push('Enter a project name of 1–160 characters.');
  if (!countries.includes(input.country)) errors.push('Choose a supported country.');
  if (input.multiCountry !== undefined && typeof input.multiCountry !== 'boolean')
    errors.push('Choose a valid multi-country setting.');
  if (!['Project', 'CAST'].includes(input.recordType)) errors.push('Choose a valid record type.');
  if (!Number.isFinite(input.budget) || input.budget < 0)
    errors.push('Budget must be zero or more.');
  if (!Number.isSafeInteger(input.participants) || input.participants < 0)
    errors.push('Participants must be a whole number, zero or more.');
  if (!validDate(input.startDate) || !validDate(input.endDate))
    errors.push('Enter valid start and end dates.');
  else if (input.endDate < input.startDate)
    errors.push('End date must be on or after the start date.');
  if (!input.summary.trim() || input.summary.length > 4000)
    errors.push('Enter a summary of 1–4,000 characters.');
  if (input.documents.some((d) => !d.label.trim() || !safeDocumentUrl(d.url)))
    errors.push('Document links need a label and an HTTPS address.');
  if (input.documents.some((d) => d.kind !== undefined && !documentKinds.includes(d.kind)))
    errors.push('Choose a valid document category.');
  errors.push(
    ...validateProfile(input.profile),
    ...validateRelationships(input, projects, ignoreId),
  );
  return errors;
}
function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function safeDocumentUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function previewErrors(p: Project, c: Checklist): string[] {
  const kind = approvalKind(p);
  if (!kind)
    return [
      'This project is not ready for a new approval request at its current stage and status.',
    ];
  const errors = validateProject(
    { ...p, parentId: undefined, profile: { ...p.profile, umbrellaId: undefined } },
    [],
    p.id,
  );
  if (!c.comments.trim() || c.comments.length > 2000)
    errors.push('Add submission comments (up to 2,000 characters).');
  if (kind === 'Design') {
    if (!c.thematic || !c.monitoring || !c.budget)
      errors.push('Confirm the three design readiness checks.');
    if (!['up-to-three-years', 'over-three-years'].includes(c.duration))
      errors.push('Choose one project duration.');
  }
  return errors;
}
export function makePreview(p: Project, c: Checklist): RequestPreview {
  const errors = previewErrors(p, c);
  if (errors.length) throw new Error(errors.join(' '));
  const kind = approvalKind(p)!;
  return {
    id: crypto.randomUUID(),
    projectId: p.id,
    projectVersion: p.version,
    kind,
    createdAt: new Date().toISOString(),
    checklist: { ...c },
    status: 'Preview only — not submitted',
    payload:
      kind === 'CAST'
        ? { Title: p.code, ProjectName: p.name, Country: p.country }
        : {
            Title: p.code,
            ProjectName: p.name,
            Country: p.country,
            CountryCode: p.countryCode,
            FlowCode: kind === 'Outline' ? '1' : '2',
          },
  };
}
export function nextAction(p: Project): string {
  if (p.approvalStatus === 'Pending Thematic Approval') return 'Await approval feedback';
  const kind = approvalKind(p);
  if (kind) return `Prepare ${kind.toLowerCase()} approval`;
  return p.stage === 'Seeking Lead Funding'
    ? 'Develop funding opportunities'
    : p.stage === 'Active'
      ? 'Review delivery progress'
      : p.stage === 'Closed'
        ? 'Review project history'
        : 'Review project status';
}
export function filterProjects(
  projects: Project[],
  search: string,
  country: string,
  stage: string,
  type: string,
): Project[] {
  const query = search.trim().toLowerCase();
  return projects.filter(
    (p) =>
      (!query || `${p.code} ${p.name} ${p.country} ${p.summary}`.toLowerCase().includes(query)) &&
      (!country || p.country === country) &&
      (!stage || p.stage === stage) &&
      (!type || p.recordType === type),
  );
}
