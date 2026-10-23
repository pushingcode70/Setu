// src/Components/ProjectCard.jsx
import { PROJECT_TYPES, STATUS_LABELS } from "../contract";
import { eth, fmtDate, short } from "../utils";

const ZERO = "0x0000000000000000000000000000000000000000";

export default function ProjectCard({ p, maxRejects, children }) {
  const overdue = p.deadline * 1000 < Date.now();
  return (
    <article className="card project">
      <header className="project-head">
        <h3>Project #{p.id}</h3>
        <span className={`pill pill-${p.status}`}>{STATUS_LABELS[p.status] ?? `Status ${p.status}`}</span>
      </header>

      <dl className="facts">
        <div><dt>Type</dt><dd>{PROJECT_TYPES[p.type] ?? p.type}</dd></div>
        <div><dt>Payment</dt><dd>{eth(p.contractAmount)}</dd></div>
        <div><dt>Escrow</dt><dd>{eth(p.escrow)}</dd></div>
        <div><dt>Deadline</dt><dd className={overdue ? "text-bad" : ""}>{fmtDate(p.deadline)}</dd></div>
        <div><dt>Client</dt><dd title={p.client}>{short(p.client)}</dd></div>
        {p.freelancer !== ZERO && (
          <div><dt>Freelancer</dt><dd title={p.freelancer}>{short(p.freelancer)}</dd></div>
        )}
        {p.rejectCount > 0 && (
          <div><dt>Rejections</dt><dd>{p.rejectCount}{maxRejects ? ` of ${maxRejects}` : ""}</dd></div>
        )}
      </dl>

      {children && <div className="actions">{children}</div>}
    </article>
  );
}