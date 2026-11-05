import { describe, it, expect } from 'vitest';
import { seedProjects } from '../data/seed';
import {
  approvalKind,
  emptyChecklist,
  filterProjects,
  makePreview,
  previewErrors,
  safeDocumentUrl,
  validateProject,
} from './projects';
const projects = seedProjects();
describe('project validation and discovery', () => {
  it('combines text, country, stage and record filters', () => {
    expect(
      filterProjects(projects, '  learning ', 'Kenya', 'Project Outline', 'CAST').map(
        (p) => p.code,
      ),
    ).toEqual(['DEMO-KE-107']);
    expect(filterProjects(projects, '', 'Rwanda', 'Active', '')).toEqual([]);
  });
  it('rejects duplicate codes and invalid budgets, counts, dates and document links', () => {
    const invalid = {
      ...projects[0],
      budget: -1,
      participants: 1.2,
      endDate: '2025-01-01',
      documents: [{ label: 'Unsafe', url: 'javascript:alert(1)' }],
    };
    expect(validateProject(invalid, projects)).toHaveLength(5);
    expect(
      validateProject({ ...projects[0], startDate: '2027-02-30' }, [], projects[0].id),
    ).toContain('Enter valid start and end dates.');
  });
  it('accepts only HTTPS document URLs without embedded credentials', () => {
    expect(safeDocumentUrl('https://example.com/brief')).toBe(true);
    for (const url of [
      'javascript:alert(1)',
      'http://example.com',
      '//example.com',
      'https://user:pass@example.com',
    ])
      expect(safeDocumentUrl(url)).toBe(false);
  });
});
describe('stage-aware preview contracts', () => {
  it('uses confirmed string FlowCodes and project code as Title', () => {
    const outline = makePreview(projects[0], {
      ...emptyChecklist,
      comments: 'Ready for outline review',
    });
    expect(outline.payload).toEqual({
      Title: 'DEMO-KE-101',
      ProjectName: projects[0].name,
      Country: 'Kenya',
      CountryCode: 'KE',
      FlowCode: '1',
    });
    const design = makePreview(projects[1], {
      thematic: true,
      monitoring: true,
      budget: true,
      duration: 'up-to-three-years',
      comments: 'Ready for design review',
    });
    expect(design.payload.FlowCode).toBe('2');
    expect(design.status).toBe('Preview only — not submitted');
  });
  it('requires design checks, one duration and comments', () => {
    expect(previewErrors(projects[1], emptyChecklist)).toHaveLength(3);
    expect(() => makePreview(projects[1], emptyChecklist)).toThrow();
  });
  it('blocks pending and approved records and distinguishes CAST', () => {
    expect(approvalKind(projects[2])).toBeNull();
    expect(approvalKind(projects[3])).toBeNull();
    expect(approvalKind(projects[6])).toBe('CAST');
    const cast = makePreview(projects[6], { ...emptyChecklist, comments: 'Assessment ready' });
    expect(cast.payload).not.toHaveProperty('FlowCode');
  });
});
