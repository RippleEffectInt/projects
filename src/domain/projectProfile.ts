import type { Project } from './projects';
export const profileTextFields = [
  ['duration', 'Duration'],
  ['region', 'Region'],
  ['projectManager', 'Project manager'],
  ['participantFocus', 'Participant focus'],
  ['themes', 'Project themes'],
  ['narrative', 'Project narrative'],
  ['problemOne', 'Problem statement 1'],
  ['problemTwo', 'Problem statement 2'],
  ['problemThree', 'Problem statement 3'],
  ['recommendations', 'Key recommendations'],
  ['progressReason', 'Progress reason'],
  ['fundingStatus', 'Funding status'],
] as const;
export const participantFields = [
  ['plannedDirect', 'Planned direct participants'],
  ['plannedIndirect', 'Planned indirect community participants'],
  ['newParticipants', 'Participants new to Ripple Effect'],
  ['totalParticipants', 'Total participant numbers'],
] as const;
export type ProjectProfile = Partial<Record<(typeof profileTextFields)[number][0], string>> &
  Partial<Record<(typeof participantFields)[number][0], number>> & {
    actualStartDate?: string;
    actualEndDate?: string;
    umbrellaId?: string;
  };
export interface PreviousValues {
  at: string;
  version: number;
  name: string;
  participants: Partial<Record<(typeof participantFields)[number][0], number>>;
}
export const documentKinds = [
  'other',
  'library',
  'design-template',
  'report',
  'cast',
  'workplan',
  'project',
] as const;
export const documentLabels: Record<(typeof documentKinds)[number], string> = {
  other: 'Other document',
  library: 'Document library',
  'design-template': 'CA design template',
  report: 'CA full report',
  cast: 'CAST',
  workplan: 'Design workplan',
  project: 'Project link',
};
const validDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
export function validateProfile(profile: ProjectProfile | undefined): string[] {
  if (profile === undefined) return [];
  if (!profile || typeof profile !== 'object' || Array.isArray(profile))
    return ['Project details must be valid.'];
  const errors: string[] = [];
  for (const [key, label] of profileTextFields)
    if (
      profile[key] !== undefined &&
      (typeof profile[key] !== 'string' || profile[key]!.length > 8000)
    )
      errors.push(`${label} must be text of up to 8,000 characters.`);
  for (const [key, label] of participantFields)
    if (profile[key] !== undefined && (!Number.isSafeInteger(profile[key]) || profile[key]! < 0))
      errors.push(`${label} must be a whole number, zero or more.`);
  for (const key of ['actualStartDate', 'actualEndDate'] as const)
    if (
      profile[key] !== undefined &&
      profile[key] !== '' &&
      (typeof profile[key] !== 'string' || !validDate(profile[key]!))
    )
      errors.push('Enter valid actual implementation dates.');
  if (profile.actualEndDate && !profile.actualStartDate)
    errors.push('Add an actual start date before an actual end date.');
  if (
    profile.actualStartDate &&
    profile.actualEndDate &&
    profile.actualEndDate < profile.actualStartDate
  )
    errors.push('Actual end date must be on or after actual start date.');
  if (profile.umbrellaId !== undefined && typeof profile.umbrellaId !== 'string')
    errors.push('Choose a valid umbrella project.');
  return errors;
}
export function validateRelationships(
  input: { parentId?: string; profile?: ProjectProfile },
  projects: Project[],
  id?: string,
): string[] {
  const errors: string[] = [];
  for (const [kind, target] of [
    ['parent', input.parentId],
    ['umbrella', input.profile?.umbrellaId],
  ] as const) {
    if (!target) continue;
    const record = projects.find((p) => p.id === target);
    if (!record || record.recordType !== 'Project' || target === id) {
      errors.push(`Choose a different existing project as the ${kind}.`);
      continue;
    }
    if (kind === 'umbrella' && !record.multiCountry)
      errors.push('The umbrella must be a multi-country project.');
    const visited = new Set<string>();
    const stack = [target];
    while (stack.length) {
      const current = stack.pop()!;
      if (current === id) {
        errors.push('Project relationships must not form a cycle.');
        break;
      }
      if (visited.has(current)) continue;
      visited.add(current);
      const p = projects.find((p) => p.id === current);
      if (p?.parentId) stack.push(p.parentId);
      if (p?.profile?.umbrellaId) stack.push(p.profile.umbrellaId);
    }
  }
  return [...new Set(errors)];
}
export function previousValues(project: Project): PreviousValues {
  return {
    at: new Date().toISOString(),
    version: project.version,
    name: project.name,
    participants: Object.fromEntries(
      participantFields
        .filter(([key]) => project.profile?.[key] !== undefined)
        .map(([key]) => [key, project.profile![key]]),
    ),
  };
}
