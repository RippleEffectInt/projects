import ProjectProfileDetail, { EarlierValues } from './ProjectProfileDetail';
import { documentLabels } from '../domain/projectProfile';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  FileText,
  Pencil,
  Users,
  Wallet,
} from 'lucide-react';
import {
  approvalKind,
  nextAction,
  safeDocumentUrl,
  stages,
  type Project,
  type RequestPreview,
} from '../domain/projects';
import { money, date } from '../domain/format';
export { money, date } from '../domain/format';
export function Badge({ children, tone = '' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export default function ProjectDetail({
  project,
  projects,
  previews,
  onBack,
  onEdit,
  onPreview,
  onViewPreview,
  onProject,
}: {
  project: Project;
  projects: Project[];
  previews: RequestPreview[];
  onBack: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onViewPreview: (p: RequestPreview) => void;
  onProject: (id: string) => void;
}) {
  const [tab, setTab] = useState('Overview');
  const saved = previews.filter((r) => r.projectId === project.id);
  const kind = approvalKind(project);
  const alreadySaved = saved.some((r) => r.projectVersion === project.version && r.kind === kind);
  const related = projects.filter(
    (p) =>
      p.id === project.parentId ||
      p.parentId === project.id ||
      p.id === project.profile?.umbrellaId ||
      p.profile?.umbrellaId === project.id,
  );
  return (
    <>
      <button className="back text-button" onClick={onBack}>
        <ArrowLeft size={17} />
        All projects
      </button>
      <div className="page-heading">
        <div>
          <div className="project-meta">
            <span className="eyebrow">{project.code}</span>
            <Badge>{project.country}</Badge>
            {project.multiCountry && <Badge tone="blue">Multi-country</Badge>}
            {project.recordType === 'CAST' && <Badge tone="purple">CAST</Badge>}
          </div>
          <h1>{project.name}</h1>
          <p className="muted">Fictional project · version {project.version} · GBP demo budget</p>
        </div>
        <button
          className="secondary"
          disabled={project.approvalStatus === 'Pending Thematic Approval'}
          onClick={onEdit}
        >
          <Pencil size={16} />
          Edit project
        </button>
      </div>
      <div className="stage-track" role="region" tabIndex={0} aria-label="Project stages">
        {stages.map((s, i) => (
          <div key={s} className={i <= stages.indexOf(project.stage) ? 'reached' : ''}>
            <span>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <div className="next-action">
        <div>
          <span className="eyebrow">NEXT ACTION</span>
          <h3>{nextAction(project)}</h3>
          <p>
            {alreadySaved
              ? 'A preview is saved for this version. Review it in the Approvals tab.'
              : project.approvalStatus === 'Pending Thematic Approval'
                ? 'This fictional example is awaiting feedback. Editing and new requests are locked.'
                : kind
                  ? 'Check the details and prepare a demo request for review.'
                  : 'Keep the project information and activity up to date.'}
          </p>
        </div>
        {kind && !alreadySaved && (
          <button className="primary" onClick={onPreview}>
            Prepare approval
            <ChevronRight size={17} />
          </button>
        )}
      </div>
      <div className="tabs" role="tablist" aria-label="Project detail">
        {['Overview', 'Approvals', 'Activity'].map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-controls="detail-panel"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onKeyDown={(e) => {
              const tabs = ['Overview', 'Approvals', 'Activity'];
              const index = tabs.indexOf(t);
              const next =
                e.key === 'ArrowRight'
                  ? tabs[(index + 1) % tabs.length]
                  : e.key === 'ArrowLeft'
                    ? tabs[(index + tabs.length - 1) % tabs.length]
                    : e.key === 'Home'
                      ? tabs[0]
                      : e.key === 'End'
                        ? tabs[2]
                        : null;
              if (next) {
                e.preventDefault();
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Approvals' && <span>{saved.length}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="detail-panel" aria-labelledby={`tab-${tab}`}>
        {tab === 'Overview' && (
          <div className="detail-grid">
            <section className="panel">
              <h2>About this project</h2>
              <p className="summary preserve">{project.summary}</p>
              <div className="facts">
                <div>
                  <Wallet />
                  <span>
                    Planned budget<strong>{money(project.budget)}</strong>
                  </span>
                </div>
                <div>
                  <Users />
                  <span>
                    Planned direct participants
                    <strong>
                      {project.profile?.plannedDirect?.toLocaleString('en-GB') ?? 'Not recorded'}
                    </strong>
                  </span>
                </div>
                <div>
                  <CalendarDays />
                  <span>
                    Planned start<strong>{date(project.startDate)}</strong>
                  </span>
                </div>
                <div>
                  <CalendarDays />
                  <span>
                    Planned end<strong>{date(project.endDate)}</strong>
                  </span>
                </div>
              </div>
            </section>
            <div>
              <section className="panel">
                <h2>At a glance</h2>
                <dl className="review-list">
                  <div>
                    <dt>Stage</dt>
                    <dd>{project.stage}</dd>
                  </div>
                  <div>
                    <dt>Approval</dt>
                    <dd>
                      <Badge
                        tone={
                          project.approvalStatus === 'Rejected'
                            ? 'rose'
                            : project.approvalStatus.includes('Pending')
                              ? 'amber'
                              : ''
                        }
                      >
                        {project.approvalStatus}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>Design</dt>
                    <dd>{project.designStatus}</dd>
                  </div>
                  <div>
                    <dt>Record type</dt>
                    <dd>{project.recordType}</dd>
                  </div>
                </dl>
              </section>
              <section className="panel">
                <h2>Documents</h2>
                {!project.documents.length && <p className="muted">No document links added yet.</p>}
                {project.documents.map((d, i) => (
                  <a
                    key={i}
                    className="document-link"
                    href={safeDocumentUrl(d.url) ? d.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={19} />
                    <span>
                      {d.label}
                      <small className="document-category">
                        {documentLabels[d.kind ?? 'other']}
                      </small>
                    </span>
                    <ArrowUpRight size={17} />
                  </a>
                ))}
                <p className="caption">Example links open in a new tab.</p>
              </section>
            </div>
            <ProjectProfileDetail project={project} />
            {related.length > 0 && (
              <section className="panel span-two">
                <h2>Related records</h2>
                {related.map((p) => (
                  <button
                    className="related"
                    key={p.id}
                    onClick={() => {
                      setTab('Overview');
                      onProject(p.id);
                    }}
                  >
                    <span>
                      <small>
                        {p.code} · {p.recordType}
                        {p.id === project.parentId
                          ? ' · Parent'
                          : p.id === project.profile?.umbrellaId
                            ? ' · Umbrella'
                            : p.parentId === project.id
                              ? ' · Child'
                              : ' · Umbrella member'}
                      </small>
                      <strong>{p.name}</strong>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </section>
            )}
          </div>
        )}
        {tab === 'Approvals' && (
          <section className="panel">
            <div className="section-heading">
              <h2>Approval history</h2>
              <Badge tone="amber">Demo previews only</Badge>
            </div>
            <p className="muted">
              No live approval history is connected. These previews never trigger a flow.
            </p>
            {saved.length ? (
              saved.map((r) => (
                <button className="related" key={r.id} onClick={() => onViewPreview(r)}>
                  <span>
                    <small>
                      {date(r.createdAt)} · version {r.projectVersion}
                      {r.projectVersion !== project.version ? ' · earlier version' : ''}
                    </small>
                    <strong>{r.kind} approval preview</strong>
                    <small>{r.status}</small>
                  </span>
                  <ChevronRight size={19} />
                </button>
              ))
            ) : (
              <div className="empty">
                <FileText size={30} />
                <h3>No previews saved yet</h3>
                <p>
                  {kind
                    ? 'Prepare an approval to review the proposed request.'
                    : 'New approval previews are unavailable at this stage and status.'}
                </p>
              </div>
            )}
          </section>
        )}
        {tab === 'Activity' && (
          <section className="panel">
            <h2>Project activity</h2>
            <p className="muted">Fictional examples and changes made in this browser.</p>
            <EarlierValues project={project} />
            <ol className="timeline">
              {[...project.history].reverse().map((h) => (
                <li key={h.id}>
                  <span className="timeline-dot" />
                  <div>
                    <small>{date(h.at)} · Demo</small>
                    <h3>{h.title}</h3>
                    <p>{h.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  );
}
