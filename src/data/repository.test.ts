import { beforeEach, describe, it, expect } from 'vitest';
import { DemoRepository } from './repository';
import { emptyChecklist } from '../domain/projects';
let repository: DemoRepository;
beforeEach(() => {
  repository = new DemoRepository();
});
describe('demo persistence', () => {
  it('creates and reloads a project without modifying seed examples', () => {
    const p = repository.load().projects[0];
    const state = repository.create({
      ...p,
      code: 'DEMO-KEXX00109',
      name: 'New fictional project',
    });
    expect(state.projects).toHaveLength(9);
    expect(repository.load().projects[0].name).toBe('New fictional project');
    expect(state.projects[0].stage).toBe('Project Outline');
  });
  it('keeps codes stable, rejects stale edits and locks pending records', () => {
    const p = repository.load().projects[0];
    expect(() => repository.update(p.id, 1, { ...p, code: 'DEMO-CHANGED' })).toThrow('stable');
    repository.update(p.id, 1, { ...p, name: 'Revised fictional name' });
    expect(() => repository.update(p.id, 1, p)).toThrow('another tab');
    const pending = repository.load().projects[2];
    expect(() => repository.update(pending.id, 1, pending)).toThrow('pending');
  });
  it('saves a preview once per version without changing stage or approval status', () => {
    const p = repository.load().projects[0];
    const c = { ...emptyChecklist, comments: 'Fictional review context' };
    const state = repository.savePreview(p.id, 1, c);
    expect(state.projects[0].stage).toBe(p.stage);
    expect(state.projects[0].approvalStatus).toBe(p.approvalStatus);
    expect(state.projects[0].history.at(-1)?.detail).toContain('no approval sent');
    expect(() => repository.savePreview(p.id, 1, c)).toThrow('already saved');
    repository.update(p.id, 1, { ...p, name: 'Another name' });
    expect(repository.savePreview(p.id, 2, c).previews).toHaveLength(2);
  });
  it('fails visibly on corrupt or unsupported stored data and supports reset', () => {
    localStorage.setItem('ripple-projects-demo-v1', '{"schema":2}');
    expect(() => repository.load()).toThrow('Reset the demo');
    expect(repository.reset().projects).toHaveLength(8);
  });
  it('reports storage failures without pretending to save', () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
      length: 0,
      clear: () => {},
      key: () => null,
    };
    expect(() =>
      new DemoRepository(blocked).create({
        ...repository.load().projects[0],
        code: 'DEMO-KEXX00109',
      }),
    ).toThrow('Could not save');
  });
});

describe('global demo code allocation', () => {
  it('continues the same sequence across countries and multi-country projects', () => {
    const p = repository.load().projects[0];
    repository.create({ ...p, code: 'DEMO-KEXX00109', multiCountry: false });
    const state = repository.create({
      ...p,
      code: 'DEMO-RWMC00110',
      country: 'Rwanda',
      multiCountry: true,
    });
    expect(state.nextProjectNumber).toBe(111);
    expect(repository.load().projects[0]).toMatchObject({
      code: 'DEMO-RWMC00110',
      multiCountry: true,
    });
  });
  it('rejects stale numbers, mismatched countries and mismatched multi-country flags', () => {
    const p = repository.load().projects[0];
    repository.create({ ...p, code: 'DEMO-KEXX00109' });
    expect(() => repository.create({ ...p, country: 'Rwanda', code: 'DEMO-RWXX00109' })).toThrow(
      'global demo number has changed',
    );
    expect(() => repository.create({ ...p, code: 'DEMO-RWXX00110' })).toThrow('selected country');
    expect(() => repository.create({ ...p, code: 'DEMO-KEMC00110', multiCountry: false })).toThrow(
      'multi-country setting',
    );
  });
  it('preserves the counter through record removal and cannot renumber on edit', () => {
    const p = repository.load().projects[0];
    const state = repository.create({ ...p, code: 'DEMO-KEXX00109' });
    localStorage.setItem(
      'ripple-projects-demo-v1',
      JSON.stringify({
        ...state,
        projects: state.projects.filter((item) => item.code !== 'DEMO-KEXX00109'),
      }),
    );
    expect(repository.create({ ...p, code: 'DEMO-KEXX00110' }).nextProjectNumber).toBe(111);
    expect(() => repository.update(p.id, 1, { ...p, country: 'Rwanda' })).toThrow(
      'Country is fixed',
    );
    expect(() => repository.update(p.id, 1, { ...p, multiCountry: true })).toThrow(
      'multi-country setting is fixed',
    );
  });
});
