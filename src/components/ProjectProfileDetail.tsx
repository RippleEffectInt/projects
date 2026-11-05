import { participantFields, profileTextFields } from '../domain/projectProfile';
import type { Project } from '../domain/projects';
import { date } from '../domain/format';
export default function ProjectProfileDetail({ project }: { project: Project }) {
  const profile = project.profile ?? {};
  return (
    <section className="panel span-two">
      <h2>Delivery and project information</h2>
      <div className="profile-summary">
        <h3>Participants</h3>
        <p className="caption">
          These are separate measures. Groups may overlap; no total is inferred.
        </p>
        <dl className="profile-values">
          {participantFields.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {profile[key] === undefined
                  ? 'Not recorded'
                  : profile[key]!.toLocaleString('en-GB')}
              </dd>
            </div>
          ))}
        </dl>
        <h3>Implementation dates</h3>
        <dl className="profile-values">
          <div>
            <dt>Actual implementation start</dt>
            <dd>{profile.actualStartDate ? date(profile.actualStartDate) : 'Not recorded'}</dd>
          </div>
          <div>
            <dt>Actual implementation end</dt>
            <dd>{profile.actualEndDate ? date(profile.actualEndDate) : 'Not recorded'}</dd>
          </div>
        </dl>
      </div>
      <details className="profile-read">
        <summary>Team, themes, narrative and progress</summary>
        <dl className="profile-values">
          {profileTextFields.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd className="preserve">{profile[key] || 'Not recorded'}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
export function EarlierValues({ project }: { project: Project }) {
  const previous = project.previousValues;
  return previous ? (
    <details className="profile-read">
      <summary>Earlier name and participant values · version {previous.version}</summary>
      <p className="caption">
        Recorded before the demo revision on {date(previous.at)}. Read-only history, separate from
        current values.
      </p>
      <dl className="profile-values">
        <div>
          <dt>Earlier name</dt>
          <dd>{previous.name}</dd>
        </div>
        {participantFields.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              {previous.participants[key] === undefined
                ? 'Not recorded'
                : previous.participants[key]!.toLocaleString('en-GB')}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  ) : null;
}
