import { useState } from 'react';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import {
  approvalKind,
  emptyChecklist,
  previewErrors,
  type Project,
  type Checklist,
  type RequestPreview,
} from '../domain/projects';
import Modal from './Modal';
export function ApprovalPreview({
  project,
  onSave,
  onClose,
}: {
  project: Project;
  onSave: (c: Checklist) => void;
  onClose: () => void;
}) {
  const kind = approvalKind(project);
  const [checklist, setChecklist] = useState<Checklist>({ ...emptyChecklist });
  const [errors, setErrors] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  function check() {
    const issues = previewErrors(project, checklist);
    setErrors(issues);
    if (!issues.length) setReview(true);
  }
  function save() {
    try {
      onSave(checklist);
    } catch (e) {
      setErrors([(e as Error).message]);
    }
  }
  return (
    <Modal title={`${kind ?? 'Approval'} approval preview`} onClose={onClose} wide>
      <div className="notice">
        <Info size={19} />
        <div>
          <strong>Preview only. No approval will be sent.</strong>
          <p>SharePoint and Power Automate are not connected.</p>
        </div>
      </div>
      <p className="eyebrow">
        {project.code} · VERSION {project.version}
      </p>
      <h3>{project.name}</h3>
      {errors.length > 0 && (
        <div className="error" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      {review ? (
        <>
          <h3>Review your request</h3>
          {kind === 'CAST' && (
            <p className="caption">
              CAST field mapping is unverified. These are proposed demo fields, not a production
              request contract.
            </p>
          )}
          <dl className="review-list">
            <div>
              <dt>Request</dt>
              <dd>{kind}</dd>
            </div>
            <div>
              <dt>Destination when integrated</dt>
              <dd>{kind === 'CAST' ? 'CAST Approvals' : 'Approval Project Outline'}</dd>
            </div>
            {kind !== 'CAST' && (
              <div>
                <dt>FlowCode (string)</dt>
                <dd>“{kind === 'Outline' ? '1' : '2'}”</dd>
              </div>
            )}
            <div>
              <dt>Project code → Title</dt>
              <dd>{project.code}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>
                {project.country} ({project.countryCode})
              </dd>
            </div>
            <div>
              <dt>Submission comments</dt>
              <dd className="preserve">{checklist.comments}</dd>
            </div>
            {kind === 'Design' && (
              <>
                <div>
                  <dt>Readiness confirmations</dt>
                  <dd>Thematic, M&amp;E and budget confirmed</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>
                    {checklist.duration === 'up-to-three-years'
                      ? 'Up to three years'
                      : 'Over three years'}
                  </dd>
                </div>
              </>
            )}
          </dl>
          <p className="caption">
            Saving records a demo preview in this browser. It does not change project stage or
            approval status.
          </p>
        </>
      ) : (
        <>
          <h4>Expected route</h4>
          <div className="route">
            <span>{kind === 'CAST' ? 'Country director' : 'Combined thematic / M&E review'}</span>
            {kind === 'Outline' && (
              <>
                <ArrowRight size={18} />
                <span>Country director</span>
              </>
            )}
          </div>
          {kind === 'Design' && (
            <>
              <p className="muted">
                The thematic card asks for two days of M&amp;E, Finance and Comms feedback. A
                two-day delay is not enforced in the inspected flow.
              </p>
              <fieldset>
                <legend>Design readiness</legend>
                <p className="caption">
                  Provisional checks. The full production checklist still needs source mapping.
                </p>
                {(['thematic', 'monitoring', 'budget'] as const).map((k, i) => (
                  <label className="check" key={k}>
                    <input
                      type="checkbox"
                      checked={checklist[k]}
                      onChange={(e) => setChecklist({ ...checklist, [k]: e.target.checked })}
                    />
                    {
                      [
                        'Thematic review completed',
                        'Monitoring & evaluation review completed',
                        'Budget reviewed',
                      ][i]
                    }
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Project duration</legend>
                <label className="check">
                  <input
                    type="radio"
                    name="duration"
                    checked={checklist.duration === 'up-to-three-years'}
                    onChange={() => setChecklist({ ...checklist, duration: 'up-to-three-years' })}
                  />
                  Up to three years
                </label>
                <label className="check">
                  <input
                    type="radio"
                    name="duration"
                    checked={checklist.duration === 'over-three-years'}
                    onChange={() => setChecklist({ ...checklist, duration: 'over-three-years' })}
                  />
                  Over three years
                </label>
              </fieldset>
            </>
          )}
          <label>
            Submission comments
            <textarea
              rows={4}
              maxLength={2000}
              value={checklist.comments}
              onChange={(e) => setChecklist({ ...checklist, comments: e.target.value })}
              placeholder="Explain what is ready for review and any context for the approver."
            />
          </label>
          <div className="soft-box">
            <strong>What happens after approval?</strong>
            <p>
              {kind === 'Outline'
                ? 'The project moves to Project Design, with In Design and Waiting Submission statuses.'
                : kind === 'Design'
                  ? 'The project moves to Seeking Lead Funding, Fully Designed and Approved.'
                  : 'The CAST flow records the country director’s decision: Approved, Resubmit or Take no further.'}
            </p>
          </div>
        </>
      )}
      <div className="modal-footer">
        <button className="secondary" onClick={review ? () => setReview(false) : onClose}>
          {review ? 'Back to checks' : 'Cancel'}
        </button>
        <button className="primary" onClick={review ? save : check}>
          {review ? (
            <>
              <CheckCircle2 size={17} />
              Save demo preview
            </>
          ) : (
            <>
              Review preview
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
export function SavedPreview({
  preview,
  onClose,
}: {
  preview: RequestPreview;
  onClose: () => void;
}) {
  return (
    <Modal title={`${preview.kind} preview · version ${preview.projectVersion}`} onClose={onClose}>
      <div className="notice">
        <Info size={19} />
        <div>
          <strong>{preview.status}</strong>
          <p>No approval was sent.</p>
        </div>
      </div>
      <h3>
        {preview.kind === 'CAST' ? 'Proposed fields · mapping unverified' : 'Contract preview'}
      </h3>
      <dl className="review-list">
        {Object.entries(preview.payload).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h3>Comments</h3>
      <p className="preserve">{preview.checklist.comments}</p>
      {preview.kind === 'Design' && (
        <p>
          Design checks: thematic, M&amp;E and budget confirmed. Duration:{' '}
          {preview.checklist.duration === 'up-to-three-years'
            ? 'up to three years'
            : 'over three years'}
          .
        </p>
      )}
      <p className="caption">
        Comments and readiness checks are retained locally. Their SharePoint field mappings are
        unconfirmed.
      </p>
      <div className="modal-footer">
        <button className="secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
