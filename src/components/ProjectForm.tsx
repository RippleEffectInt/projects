import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  countries,
  countryCodes,
  validateProject,
  type Project,
  type ProjectInput,
} from '../domain/projects';
import Modal from './Modal';
import { formatProjectCode, nextDemoProjectNumber } from '../domain/projectCodes';
export default function ProjectForm({
  project,
  projects,
  onSave,
  onClose,
  nextProjectNumber,
}: {
  project?: Project;
  projects: Project[];
  onSave: (input: ProjectInput) => void;
  onClose: () => void;
  nextProjectNumber?: number;
}) {
  const [input, setInput] = useState<ProjectInput>(
    project
      ? {
          multiCountry: project.multiCountry ?? false,
          code: project.code,
          name: project.name,
          country: project.country,
          recordType: project.recordType,
          budget: project.budget,
          participants: project.participants,
          startDate: project.startDate,
          endDate: project.endDate,
          summary: project.summary,
          documents: project.documents.map((d) => ({ ...d })),
        }
      : {
          multiCountry: false,
          code: 'DEMO-',
          name: '',
          country: 'Kenya',
          recordType: 'Project',
          budget: 0,
          participants: 0,
          startDate: '',
          endDate: '',
          summary: '',
          documents: [],
        },
  );
  const descriptionCode = input.multiCountry ? 'MC' : 'XX';
  const autoNumber = nextProjectNumber ?? nextDemoProjectNumber(projects.map((p) => p.code));
  const generatedCode = /^[A-Z]{2}$/.test(descriptionCode)
    ? formatProjectCode(countryCodes[input.country], descriptionCode, autoNumber)
    : '';
  const displayedCode = project ? input.code : generatedCode ? `DEMO-${generatedCode}` : '';
  const [errors, setErrors] = useState<string[]>([]);
  function field<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const submitted = { ...input, code: displayedCode };
    const issues = validateProject(submitted, projects, project?.id);
    if (issues.length) {
      setErrors(issues);
      return;
    }
    try {
      onSave(submitted);
    } catch (error) {
      setErrors([(error as Error).message]);
    }
  }
  return (
    <Modal title={project ? 'Edit project' : 'Create a project'} onClose={onClose} wide>
      <p className="muted">Fictional demo data only. Your changes are saved in this browser.</p>
      <form onSubmit={submit}>
        {errors.length > 0 && (
          <div className="error" role="alert">
            <strong>Check these details</strong>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="form-grid">
          <label className="span-two">
            Project name
            <input
              required
              maxLength={160}
              value={input.name}
              onChange={(e) => field('name', e.target.value)}
              autoFocus
              placeholder="Give your project a clear name"
            />
          </label>
          <label>
            Project code
            <input
              aria-label="Project code"
              required
              value={displayedCode}
              readOnly
              disabled={!!project}
              placeholder="Choose a description code"
            />
            <small>
              {project
                ? 'Unique and fixed after creation.'
                : 'Generated automatically. DEMO- marks this as fictional.'}
            </small>
          </label>
          <label className="check span-two">
            <input
              type="checkbox"
              checked={input.multiCountry ?? false}
              disabled={!!project}
              onChange={(e) => field('multiCountry', e.target.checked)}
            />
            Multi-country project
          </label>
          {!project && (
            <div className="soft-box span-two code-preview" role="status">
              <strong>Code format preview: {generatedCode || 'automatic code'}</strong>
              <p>
                One global sequence across this browser’s projects and CAST records. The next demo
                number is {String(autoNumber).padStart(5, '0')}. A preview does not reserve it. No
                live code is allocated. Description code is XX for single-country projects or MC for
                multi-country projects.
              </p>
            </div>
          )}
          <label>
            Record type
            <select
              value={input.recordType}
              disabled={!!project}
              onChange={(e) => field('recordType', e.target.value as ProjectInput['recordType'])}
            >
              <option>Project</option>
              <option>CAST</option>
            </select>
          </label>
          <label>
            Country
            <select
              aria-label="Country"
              value={input.country}
              disabled={!!project}
              onChange={(e) => field('country', e.target.value as ProjectInput['country'])}
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Budget (GBP)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={input.budget}
              onChange={(e) =>
                field('budget', e.target.value === '' ? NaN : Number(e.target.value))
              }
            />
          </label>
          <label>
            Planned participants
            <input
              required
              type="number"
              min="0"
              step="1"
              value={input.participants}
              onChange={(e) =>
                field('participants', e.target.value === '' ? NaN : Number(e.target.value))
              }
            />
          </label>
          <div />
          <label>
            Planned start date
            <input
              required
              type="date"
              value={input.startDate}
              onChange={(e) => field('startDate', e.target.value)}
            />
          </label>
          <label>
            Planned end date
            <input
              required
              type="date"
              value={input.endDate}
              min={input.startDate}
              onChange={(e) => field('endDate', e.target.value)}
            />
          </label>
          <label className="span-two">
            Project summary
            <textarea
              required
              rows={4}
              maxLength={4000}
              value={input.summary}
              onChange={(e) => field('summary', e.target.value)}
              placeholder="What will change, and for whom?"
            />
          </label>
        </div>
        <div className="section-heading">
          <h3>Document links</h3>
          <button
            type="button"
            className="text-button"
            onClick={() => field('documents', [...input.documents, { label: '', url: '' }])}
          >
            <Plus size={16} />
            Add link
          </button>
        </div>
        {input.documents.map((d, i) => (
          <div className="document-fields" key={i}>
            <label>
              Link label
              <input
                required
                aria-label={`Document ${i + 1} label`}
                value={d.label}
                onChange={(e) =>
                  field(
                    'documents',
                    input.documents.map((v, j) => (j === i ? { ...v, label: e.target.value } : v)),
                  )
                }
              />
            </label>
            <label>
              HTTPS address
              <input
                required
                type="url"
                aria-label={`Document ${i + 1} URL`}
                placeholder="https://"
                value={d.url}
                onChange={(e) =>
                  field(
                    'documents',
                    input.documents.map((v, j) => (j === i ? { ...v, url: e.target.value } : v)),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove document ${i + 1}`}
              onClick={() =>
                field(
                  'documents',
                  input.documents.filter((_, j) => i !== j),
                )
              }
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <p className="caption">
          {project
            ? 'Stage and approval status are managed by the approval process.'
            : 'New projects start at Project Outline, waiting for submission.'}
        </p>
        <div className="modal-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            {project ? 'Save demo changes' : 'Create demo project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
