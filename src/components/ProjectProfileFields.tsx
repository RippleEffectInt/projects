import type { Project, ProjectInput } from '../domain/projects';
import {
  participantFields,
  profileTextFields,
  type ProjectProfile,
} from '../domain/projectProfile';
export default function ProjectProfileFields({
  input,
  projects,
  id,
  onChange,
}: {
  input: ProjectInput;
  projects: Project[];
  id?: string;
  onChange: (patch: Partial<ProjectInput>) => void;
}) {
  const profile = input.profile ?? {};
  function set<K extends keyof ProjectProfile>(key: K, value: ProjectProfile[K]) {
    onChange({ profile: { ...profile, [key]: value } });
  }
  const options = projects.filter((p) => p.id !== id && p.recordType === 'Project');
  return (
    <div className="profile-fields">
      <details>
        <summary>Participants and delivery dates</summary>
        <p className="caption">
          Keep each measure separate. Totals are entered independently; they are not calculated by
          adding groups that may overlap. Leave unknown values blank.
        </p>
        <div className="form-grid">
          <label>
            Duration
            <input
              aria-label="Duration"
              maxLength={8000}
              value={profile.duration ?? ''}
              onChange={(e) => set('duration', e.target.value)}
            />
          </label>
          {participantFields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                min="0"
                step="1"
                value={profile[key] ?? ''}
                onChange={(e) =>
                  set(key, e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </label>
          ))}
          <label>
            Actual implementation start
            <input
              type="date"
              value={profile.actualStartDate ?? ''}
              onChange={(e) => set('actualStartDate', e.target.value)}
            />
          </label>
          <label>
            Actual implementation end
            <input
              type="date"
              value={profile.actualEndDate ?? ''}
              min={profile.actualStartDate}
              onChange={(e) => set('actualEndDate', e.target.value)}
            />
          </label>
        </div>
      </details>
      <details>
        <summary>Narrative and progress</summary>
        <div className="form-grid">
          {profileTextFields
            .filter(
              ([key]) =>
                !['duration', 'region', 'projectManager', 'participantFocus', 'themes'].includes(
                  key,
                ),
            )
            .map(([key, label]) => (
              <label className="span-two" key={key}>
                {label}
                <textarea
                  aria-label={label}
                  maxLength={8000}
                  rows={key === 'narrative' ? 5 : 2}
                  value={profile[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                />
              </label>
            ))}
        </div>
      </details>
      <details>
        <summary>Team, themes and related projects</summary>
        <p className="caption">
          Use fictional names in this demo. Manager names do not grant access or determine
          approvers.
        </p>
        <div className="form-grid">
          {profileTextFields
            .filter(([key]) =>
              ['region', 'projectManager', 'participantFocus', 'themes'].includes(key),
            )
            .map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  maxLength={8000}
                  value={profile[key] ?? ''}
                  onChange={(e) => set(key, e.target.value)}
                />
              </label>
            ))}
          <label>
            Parent project
            <select
              aria-label="Parent project"
              value={input.parentId ?? ''}
              onChange={(e) => onChange({ parentId: e.target.value || undefined })}
            >
              <option value="">None</option>
              {options.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Multi-country umbrella
            <select
              aria-label="Multi-country umbrella"
              value={profile.umbrellaId ?? ''}
              onChange={(e) => set('umbrellaId', e.target.value || undefined)}
            >
              <option value="">None</option>
              {options
                .filter((p) => p.multiCountry)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </details>
    </div>
  );
}
