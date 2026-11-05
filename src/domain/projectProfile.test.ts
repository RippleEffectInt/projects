import { describe, it, expect } from 'vitest';
import { validateProfile, validateRelationships } from './projectProfile';
import { seedProjects } from '../data/seed';
describe('extended project fields', () => {
  it('keeps zero distinct from unknown and does not infer totals from overlapping groups', () => {
    expect(
      validateProfile({
        plannedDirect: 0,
        plannedIndirect: 100,
        newParticipants: 200,
        totalParticipants: 50,
      }),
    ).toEqual([]);
    expect(validateProfile({ plannedDirect: undefined })).toEqual([]);
    expect(validateProfile({ plannedDirect: -1, totalParticipants: 1.2 })).toHaveLength(2);
  });
  it('validates actual dates independently from planned dates', () => {
    expect(validateProfile({ actualEndDate: '2027-01-01' })).toContain(
      'Add an actual start date before an actual end date.',
    );
    expect(
      validateProfile({ actualStartDate: '2027-02-01', actualEndDate: '2027-01-01' }),
    ).toContain('Actual end date must be on or after actual start date.');
    expect(validateProfile({ actualStartDate: '2027-02-30' })).toContain(
      'Enter valid actual implementation dates.',
    );
  });
  it('prevents self links, invalid umbrella records and relationship cycles', () => {
    const projects = seedProjects();
    expect(
      validateRelationships({ parentId: projects[0].id }, projects, projects[0].id),
    ).not.toEqual([]);
    expect(
      validateRelationships({ profile: { umbrellaId: projects[0].id } }, projects, projects[1].id),
    ).toContain('The umbrella must be a multi-country project.');
    expect(
      validateRelationships({ parentId: projects[6].id }, projects, projects[0].id),
    ).not.toEqual([]);
    const linked = projects.map((p) =>
      p.id === projects[1].id ? { ...p, parentId: projects[0].id } : p,
    );
    expect(validateRelationships({ parentId: projects[1].id }, linked, projects[0].id)).toContain(
      'Project relationships must not form a cycle.',
    );
  });
});
