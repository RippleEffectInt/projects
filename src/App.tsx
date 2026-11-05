import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  Flower2,
  FolderKanban,
  Globe2,
  HelpCircle,
  Info,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sprout,
  Users,
  X,
} from 'lucide-react';
import {
  approvalKind,
  countries,
  filterProjects,
  nextAction,
  stages,
  type Checklist,
  type ProjectInput,
  type RequestPreview,
} from './domain/projects';
import { DemoRepository, type Snapshot } from './data/repository';
import ProjectForm from './components/ProjectForm';
import ProjectDetail, { Badge, money } from './components/ProjectDetail';
import { ApprovalPreview, SavedPreview } from './components/ApprovalPreview';
import Modal from './components/Modal';
const repository = new DemoRepository();
export default function App() {
  const [state, setState] = useState<Snapshot>({ schema: 1, projects: [], previews: [] });
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState('Projects');
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [stage, setStage] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('code');
  const [view, setView] = useState(() =>
    typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 650px)').matches
      ? 'cards'
      : 'list',
  );
  const [form, setForm] = useState<'create' | 'edit' | null>(null);
  const [editVersion, setEditVersion] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [saved, setSaved] = useState<RequestPreview | null>(null);
  const [reset, setReset] = useState(false);
  const [toast, setToast] = useState('');
  function reload() {
    try {
      setState(repository.load());
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
    setLoaded(true);
  }
  useEffect(() => {
    reload();
    const change = (e: StorageEvent) => {
      if (e.key === 'ripple-projects-demo-v1' || e.key === null) reload();
    };
    window.addEventListener('storage', change);
    return () => window.removeEventListener('storage', change);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(id);
  }, [toast]);
  const project = state.projects.find((p) => p.id === selected);
  const projects = filterProjects(state.projects, search, country, stage, type).sort((a, b) =>
    sort === 'budget'
      ? b.budget - a.budget
      : sort === 'name'
        ? a.name.localeCompare(b.name)
        : a.code.localeCompare(b.code),
  );
  const needsPreparation = state.projects.filter(
    (p) =>
      approvalKind(p) &&
      !state.previews.some((r) => r.projectId === p.id && r.projectVersion === p.version),
  );
  function navigate(p: string) {
    setPage(p);
    setSelected(null);
    setSearch('');
  }
  function saveProject(input: ProjectInput) {
    const next =
      form === 'edit' && project
        ? repository.update(project.id, editVersion, input)
        : repository.create(input);
    setState(next);
    setForm(null);
    if (form === 'create') {
      setSelected(next.projects[0].id);
      setPage('Projects');
    }
    setToast('Demo project saved in this browser.');
  }
  function savePreview(c: Checklist) {
    if (!project) return;
    setState(repository.savePreview(project.id, previewVersion, c));
    setPreparing(false);
    setToast('Preview saved. No approval was sent.');
  }
  function resetDemo() {
    try {
      setState(repository.reset());
      setError('');
      setSelected(null);
      setReset(false);
      setToast('Fictional demo examples restored.');
    } catch (e) {
      setError((e as Error).message);
      setReset(false);
    }
  }
  function openProject(id: string) {
    setSelected(id);
    setPage('Projects');
    window.scrollTo(0, 0);
  }
  function clearFilters() {
    setSearch('');
    setCountry('');
    setStage('');
    setType('');
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('Projects');
          }}
          aria-label="Ripple Effect projects home"
        >
          <span className="brand-mark">
            <Flower2 size={30} />
          </span>
          <span>
            Ripple Effect<small>PROJECT WORKSPACE</small>
          </span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {[
            { label: 'Projects', icon: FolderKanban },
            { label: 'Approvals', icon: ClipboardCheck },
            { label: 'Getting started', icon: HelpCircle },
          ].map(({ label, icon: Icon }) => (
            <button
              className={page === label ? 'nav-item active' : 'nav-item'}
              key={label}
              onClick={() => navigate(label)}
            >
              <Icon size={20} />
              {label}
              {label === 'Approvals' && state.previews.length > 0 && (
                <span>{state.previews.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-indicator">
            <span />
            DEMO WORKSPACE
          </div>
          <p>
            Explore the possibilities.
            <br />
            All projects here are fictional.
          </p>
          <button className="text-button" onClick={() => setReset(true)}>
            <RefreshCw size={14} />
            Reset demo data
          </button>
          <div className="sidebar-footer">
            <Sprout size={18} />A little change. A lasting impact.
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace
            <ChevronRight size={15} />
            <span>{page}</span>
            {project && (
              <>
                <ChevronRight size={15} />
                <span className="truncate">{project.code}</span>
              </>
            )}
          </div>
          <span className="connection">
            <span />
            Integrations not connected
          </span>
        </header>
        <div className="demo-banner">
          <Info size={16} />
          <span>
            <strong>You’re exploring a demo.</strong> Changes stay in this browser. Approvals are
            previews only.
          </span>
          <button onClick={() => navigate('Getting started')}>
            About this demo
            <ArrowUpRight size={14} />
          </button>
        </div>
        <main id="main-content">
          {error && (
            <div className="error" role="alert">
              <strong>Unable to load demo data</strong>
              <p>{error}</p>
              <button className="secondary" onClick={reload}>
                Refresh workspace
              </button>
              <button className="text-button" onClick={() => setReset(true)}>
                Reset demo
              </button>
            </div>
          )}
          {loaded && !error && (
            <>
              {page === 'Projects' && (
                <>
                  {project ? (
                    <ProjectDetail
                      key={project.id}
                      project={project}
                      projects={state.projects}
                      previews={state.previews}
                      onBack={() => setSelected(null)}
                      onEdit={() => {
                        setEditVersion(project.version);
                        setForm('edit');
                      }}
                      onPreview={() => {
                        setPreviewVersion(project.version);
                        setPreparing(true);
                      }}
                      onViewPreview={setSaved}
                      onProject={openProject}
                    />
                  ) : (
                    <>
                      <div className="page-heading">
                        <div>
                          <p className="eyebrow">FROM IDEA TO IMPACT</p>
                          <h1>Your projects, in one place.</h1>
                          <p className="muted">
                            See what’s moving forward and where to focus next.
                          </p>
                        </div>
                        <button className="primary" onClick={() => setForm('create')}>
                          <Plus size={18} />
                          New project
                        </button>
                      </div>
                      <section className="welcome">
                        <div>
                          <span className="welcome-label">
                            <span />A CLEARER WAY TO WORK
                          </span>
                          <h2>
                            Small steps.
                            <br />
                            Lasting change.
                          </h2>
                          <p>
                            Bring your project details, next actions and
                            <br className="desktop-break" /> approval preparation together.
                          </p>
                          <button
                            onClick={() => {
                              setPage('Approvals');
                              setSelected(null);
                            }}
                          >
                            Review next actions
                            <ArrowRight size={17} />
                          </button>
                        </div>
                        <div className="growth-art" aria-hidden="true">
                          <div className="orbit one" />
                          <div className="orbit two" />
                          <div className="orbit three" />
                          <Sprout size={132} strokeWidth={1} />
                          <span className="art-note">
                            Rooted in community.
                            <br />
                            Growing together.
                          </span>
                        </div>
                      </section>
                      <div className="stats">
                        <div>
                          <span className="stat-icon">
                            <FolderKanban size={21} />
                          </span>
                          <div>
                            <span>Total projects & CAST</span>
                            <strong>{state.projects.length}</strong>
                          </div>
                        </div>
                        <div>
                          <span className="stat-icon amber">
                            <ClipboardCheck size={21} />
                          </span>
                          <div>
                            <span>Ready to prepare</span>
                            <strong>{needsPreparation.length}</strong>
                          </div>
                        </div>
                        <div>
                          <span className="stat-icon blue">
                            <Globe2 size={21} />
                          </span>
                          <div>
                            <span>Countries represented</span>
                            <strong>{new Set(state.projects.map((p) => p.country)).size}</strong>
                          </div>
                        </div>
                        <div>
                          <span className="stat-icon purple">
                            <Users size={21} />
                          </span>
                          <div>
                            <span>Planned participants · projects</span>
                            <strong>
                              {state.projects
                                .filter((p) => p.recordType === 'Project')
                                .reduce((n, p) => n + p.participants, 0)
                                .toLocaleString('en-GB')}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <section className="project-section">
                        <div className="section-heading">
                          <div className="heading-with-count">
                            <h2>All projects</h2>
                            <span className="count">{projects.length}</span>
                          </div>
                          <div className="view-switch" aria-label="Project view">
                            <button
                              aria-label="List view"
                              aria-pressed={view === 'list'}
                              onClick={() => setView('list')}
                            >
                              <List size={18} />
                            </button>
                            <button
                              aria-label="Card view"
                              aria-pressed={view === 'cards'}
                              onClick={() => setView('cards')}
                            >
                              <LayoutGrid size={17} />
                            </button>
                          </div>
                        </div>
                        <div className="filters">
                          <label className="search">
                            <Search size={18} />
                            <input
                              aria-label="Search projects"
                              placeholder="Search by project name, code or keyword…"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </label>
                          <label className="sr-only" htmlFor="country-filter">
                            Filter by country
                          </label>
                          <select
                            id="country-filter"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          >
                            <option value="">All countries</option>
                            {countries.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <label className="sr-only" htmlFor="stage-filter">
                            Filter by stage
                          </label>
                          <select
                            id="stage-filter"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                          >
                            <option value="">All stages</option>
                            {stages.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <label className="sr-only" htmlFor="type-filter">
                            Filter by record type
                          </label>
                          <select
                            id="type-filter"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                          >
                            <option value="">All types</option>
                            <option>Project</option>
                            <option>CAST</option>
                          </select>
                        </div>
                        <div className="results-bar">
                          <span>
                            <SlidersHorizontal size={14} />
                            {projects.length} of {state.projects.length} records
                            {(search || country || stage || type) && (
                              <button className="text-button" onClick={clearFilters}>
                                Clear filters
                                <X size={13} />
                              </button>
                            )}
                          </span>
                          <label>
                            Sort by{' '}
                            <select
                              aria-label="Sort projects"
                              value={sort}
                              onChange={(e) => setSort(e.target.value)}
                            >
                              <option value="code">Project code</option>
                              <option value="name">Name</option>
                              <option value="budget">Highest budget</option>
                            </select>
                            <ArrowDown size={13} />
                          </label>
                        </div>
                        {projects.length ? (
                          view === 'list' ? (
                            <div className="table-scroll">
                              <table>
                                <thead>
                                  <tr>
                                    <th>PROJECT</th>
                                    <th>COUNTRY</th>
                                    <th>STAGE</th>
                                    <th>PLANNED BUDGET</th>
                                    <th>NEXT ACTION</th>
                                    <th>
                                      <span className="sr-only">Open project</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projects.map((p) => (
                                    <tr key={p.id}>
                                      <td>
                                        <button
                                          className="project-name"
                                          onClick={() => openProject(p.id)}
                                        >
                                          {p.name}{' '}
                                          <small>
                                            {p.code}
                                            {p.recordType === 'CAST' && (
                                              <Badge tone="purple">CAST</Badge>
                                            )}
                                          </small>
                                        </button>
                                      </td>
                                      <td>
                                        <span className="country-dot" />
                                        {p.country}
                                      </td>
                                      <td>
                                        <Badge
                                          tone={
                                            p.stage === 'Active'
                                              ? 'green'
                                              : p.stage === 'Project Design'
                                                ? 'blue'
                                                : p.stage === 'Closed'
                                                  ? 'neutral'
                                                  : ''
                                          }
                                        >
                                          {p.stage}
                                        </Badge>
                                        <small className="status-note">{p.approvalStatus}</small>
                                      </td>
                                      <td className="numeric">{money(p.budget)}</td>
                                      <td className="action-cell">{nextAction(p)}</td>
                                      <td>
                                        <button
                                          className="icon-button"
                                          aria-label={`Open ${p.name}`}
                                          onClick={() => openProject(p.id)}
                                        >
                                          <ChevronRight size={18} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="project-cards">
                              {projects.map((p) => (
                                <button
                                  className="project-card"
                                  aria-label={`Open ${p.name}`}
                                  key={p.id}
                                  onClick={() => openProject(p.id)}
                                >
                                  <div>
                                    <Badge>{p.country}</Badge>
                                    <span className="caption">{p.recordType}</span>
                                  </div>
                                  <small>{p.code}</small>
                                  <h3>{p.name}</h3>
                                  <p>{p.summary}</p>
                                  <div>
                                    <Badge tone="blue">{p.stage}</Badge>
                                    <ArrowUpRight size={18} />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )
                        ) : (
                          <div className="empty">
                            <Search size={32} />
                            <h3>No projects match your filters</h3>
                            <p>Try another keyword or broaden the filters.</p>
                            <button className="secondary" onClick={clearFilters}>
                              Clear filters
                            </button>
                          </div>
                        )}
                        <div className="table-footer">
                          <span>Fictional data for demonstration</span>
                          <span>Budgets shown in GBP · Planned figures</span>
                        </div>
                      </section>
                    </>
                  )}
                </>
              )}
              {page === 'Approvals' && (
                <>
                  <div className="page-heading">
                    <div>
                      <p className="eyebrow">THE NEXT STEP, MADE CLEAR</p>
                      <h1>Approval workspace</h1>
                      <p className="muted">Prepare a request and review what would be sent.</p>
                    </div>
                    <Badge tone="amber">Preview only</Badge>
                  </div>
                  <div className="notice">
                    <Info size={20} />
                    <div>
                      <strong>No live approval service is connected.</strong>
                      <p>
                        Saved previews stay in this browser. Pending statuses in the example
                        projects are fictional.
                      </p>
                    </div>
                  </div>
                  <section className="panel">
                    <h2>
                      Ready to prepare <span className="count">{needsPreparation.length}</span>
                    </h2>
                    {needsPreparation.map((p) => (
                      <button className="related" key={p.id} onClick={() => openProject(p.id)}>
                        <span>
                          <small>
                            {p.code} · {p.country}
                          </small>
                          <strong>{p.name}</strong>
                          <small>{approvalKind(p)} approval</small>
                        </span>
                        <ChevronRight size={19} />
                      </button>
                    ))}
                    {!needsPreparation.length && (
                      <p className="muted">
                        No new previews to prepare. Review your saved previews below.
                      </p>
                    )}
                  </section>
                  <section className="panel">
                    <h2>
                      Saved previews <span className="count">{state.previews.length}</span>
                    </h2>
                    {state.previews.length ? (
                      state.previews.map((r) => (
                        <button className="related" key={r.id} onClick={() => setSaved(r)}>
                          <span>
                            <small>
                              {r.kind} · version {r.projectVersion}
                            </small>
                            <strong>{r.payload.ProjectName}</strong>
                            <small>{r.status}</small>
                          </span>
                          <ChevronRight size={18} />
                        </button>
                      ))
                    ) : (
                      <div className="empty">
                        <CheckCheck size={30} />
                        <h3>A clear view of your requests</h3>
                        <p>Saved demo previews will appear here.</p>
                      </div>
                    )}
                  </section>
                </>
              )}
              {page === 'Getting started' && (
                <>
                  <div className="page-heading">
                    <div>
                      <p className="eyebrow">A SIMPLER PROJECT WORKSPACE</p>
                      <h1>Start with a little exploration.</h1>
                      <p className="muted">A first look at how project work could feel.</p>
                    </div>
                  </div>
                  <div className="guide-grid">
                    <section className="panel">
                      <span className="guide-number">01</span>
                      <h2>Explore the portfolio</h2>
                      <p>
                        Search by name or project code. Filter by country, stage or record type.
                        Open a project to see its summary, planned figures, documents and activity.
                      </p>
                      <button className="text-button" onClick={() => navigate('Projects')}>
                        Browse projects
                        <ArrowRight size={16} />
                      </button>
                    </section>
                    <section className="panel">
                      <span className="guide-number">02</span>
                      <h2>Make it your own</h2>
                      <p>
                        Create a fictional project or edit an example. Your changes stay in this
                        browser. Reset the demo at any time to restore the examples.
                      </p>
                      <p>
                        Use fictional information only. Avoid entering real project data or personal
                        details.
                      </p>
                      <button className="text-button" onClick={() => setReset(true)}>
                        <RefreshCw size={14} />
                        Reset demo data
                      </button>
                    </section>
                    <section className="panel">
                      <span className="guide-number">03</span>
                      <h2>Prepare an approval</h2>
                      <p>
                        Outline, Design and CAST have different routes. Review a stage-aware preview
                        and save it to the demo history. Saving sends nothing and changes no
                        approval status.
                      </p>
                      <p>
                        Design readiness checks are provisional; the full checklist needs
                        verification.
                      </p>
                    </section>
                    <section className="panel">
                      <span className="guide-number">04</span>
                      <h2>Connect with confidence</h2>
                      <p>
                        Azure hosting, Entra sign-in, SharePoint lists and Power Automate are not
                        configured. Live mode is unavailable in this iteration.
                      </p>
                      <p>
                        Existing flows still use Dataverse. A tested migration and a planned cutover
                        are required before SharePoint can become the project source.
                      </p>
                    </section>
                  </div>
                  <section className="panel">
                    <h2>What this first iteration covers</h2>
                    <p>
                      One place for project details, a clear next action, document links, related
                      CAST records, approval previews and a demo activity timeline.
                    </p>
                    <p className="muted">
                      Permissions, actual dates, funding opportunities, status-change requests and
                      substitute approver management will follow once the integration contracts are
                      confirmed.
                    </p>
                  </section>
                </>
              )}
            </>
          )}
        </main>
        <footer className="workspace-footer">
          <span>Ripple Effect · Project workspace</span>
          <span>Demo v0.1 · Built around the work that matters</span>
        </footer>
      </div>
      {form && (
        <ProjectForm
          project={form === 'edit' ? project : undefined}
          projects={state.projects}
          nextProjectNumber={state.nextProjectNumber}
          onSave={saveProject}
          onClose={() => setForm(null)}
        />
      )}
      {preparing && project && (
        <ApprovalPreview
          project={project}
          onSave={savePreview}
          onClose={() => setPreparing(false)}
        />
      )}
      {saved && <SavedPreview preview={saved} onClose={() => setSaved(null)} />}
      {reset && (
        <Modal title="Reset the demo?" onClose={() => setReset(false)}>
          <p>
            This removes projects, edits and approval previews saved in this browser and restores
            the fictional examples.
          </p>
          <div className="modal-footer">
            <button className="secondary" onClick={() => setReset(false)}>
              Keep my demo changes
            </button>
            <button className="primary" onClick={resetDemo}>
              Reset demo data
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {toast}
          <button className="icon-button" aria-label="Dismiss message" onClick={() => setToast('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
