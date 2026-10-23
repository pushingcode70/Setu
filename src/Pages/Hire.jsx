// src/Pages/Hire.jsx  (client side: post projects, pick freelancers, approve work)
import { useEffect, useState } from "react";
import { parseEther } from "ethers";
import { ConnectGate, useWallet } from "../context/WalletContext";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../Components/ProjectCard";
import { DEADLINE_MODE, PROJECT_TYPES, STATUS } from "../contract";
import { eth, fmtDuration, same, short } from "../utils";
import "./Hire.css";

export default function Hire() {
  return (
    <ConnectGate>
      <HireInner />
    </ConnectGate>
  );
}

function HireInner() {
  const { account, contract, run, busy } = useWallet();
  const { projects, limits, loading, reload } = useProjects();

  const [type, setType] = useState(0);
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [deposit, setDeposit] = useState(null);
  const [descriptions, setDescriptions] = useState({});

  // Fetch descriptions from shared off-chain store / localStorage
  useEffect(() => {
    let off = false;
    async function fetchDescriptions() {
      try {
        const res = await fetch("https://api.yourdomain.com/project-descriptions");
        if (res.ok) {
          const data = await res.json();
          if (!off) setDescriptions(data);
        }
      } catch {
        try {
          const local = JSON.parse(localStorage.getItem("hire_project_descriptions") || "{}");
          if (!off) setDescriptions(local);
        } catch {}
      }
    }
    fetchDescriptions();
    return () => { off = true; };
  }, [projects]);

  // live preview of the deposit the contract will ask for
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const wei = parseEther(amount || "0");
        if (wei === 0n) return setDeposit(null);
        const d = await contract.calculateDeposit(wei);
        if (!off) setDeposit(d);
      } catch {
        if (!off) setDeposit(null);
      }
    })();
    return () => { off = true; };
  }, [amount, contract]);

  // Link pending description to newly created project upon reload and sync
  useEffect(() => {
    if (!projects.length || !account) return;
    const pending = localStorage.getItem("pending_project_description");
    if (pending) {
      const myProjects = projects.filter((p) => same(p.client, account));
      if (myProjects.length > 0) {
        const newest = [...myProjects].sort((a, b) => Number(b.id - a.id))[0];
        if (newest && !descriptions[newest.id]) {
          const updated = { ...descriptions, [newest.id]: pending };
          setDescriptions(updated);
          localStorage.setItem("hire_project_descriptions", JSON.stringify(updated));

          fetch("https://api.yourdomain.com/project-descriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: String(newest.id), description: pending })
          }).catch(() => {});

          localStorage.removeItem("pending_project_description");
        }
      }
    }
  }, [projects, account, descriptions]);

  const deadlineTs = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;
  const valid = deposit !== null && deadlineTs * 1000 > Date.now();

  const create = (e) => {
    e.preventDefault();
    const now = Math.floor(Date.now() / 1000);
    const dl = DEADLINE_MODE === "duration" ? deadlineTs - now : deadlineTs;
    if (description.trim()) {
      localStorage.setItem("pending_project_description", description.trim());
    }
    run(
      "Create project",
      () => contract.createProject(type, parseEther(amount), dl, { value: deposit }),
      () => { setAmount(""); setDeadline(""); setDescription(""); return reload(); }
    );
  };

  const mine = projects.filter((p) => same(p.client, account));
  const act = (label, fn) => run(label, fn, reload);
  const now = Date.now();

  const protections = [
    {
      color: "purple",
      title: "Your money stays locked",
      text: "The payment sits in the contract from the moment you post. It only leaves when you approve the work, or when the rules say it should.",
    },
    {
      color: "cyan",
      title: "You choose who builds it",
      text: limits?.maxApplicants
        ? `Up to ${limits.maxApplicants} freelancers can apply to each project. Review them and select the one you trust.`
        : "Freelancers apply to your project and you select the one you trust. Nobody is assigned without your say.",
    },
    {
      color: "white",
      title: "You can ask for changes",
      text: limits?.maxRejects
        ? `If the work is not right, reject it. You can do this up to ${limits.maxRejects} times before the dispute rules apply.`
        : "If the work is not right, reject it and the freelancer can resubmit, within the limits set by the contract.",
    },
    {
      color: "yellow",
      title: "Missed deadlines are covered",
      text: "If the freelancer misses the deadline, you can claim the project back. Review submissions on time, though: unanswered work auto-approves.",
    },
  ];

  return (
    <main className="page hire">
      <div className="hire-head">
        <span className="tag tag-yellow">Client side</span>
        <h1>Hire</h1>
        <p className="lede">
          Post a project, lock the payment in escrow, and choose who builds it. The freelancer is paid only when
          you approve the work, so you never pay for something you have not received.
        </p>
      </div>

      <section className="card new-project">
        <h2>New project</h2>
        <form className="project-form" onSubmit={create}>
          <div className="form-grid">
            <label>
              Project type
              <select value={type} onChange={(e) => setType(Number(e.target.value))}>
                {PROJECT_TYPES.map((t, i) => <option key={t} value={i}>{t}</option>)}
              </select>
            </label>
            <label>
              Payment (ETH)
              <input type="number" min="0" step="any" placeholder="0.05" value={amount}
                onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className="field-wide">
              Task description
              <textarea
                placeholder="Describe the requirements, deliverables, and tasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </label>
            <label>
              Deadline
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>
          </div>

          <aside className="receipt" aria-live="polite">
            <p className="receipt-kicker">Escrow receipt</p>
            <p className="receipt-amount">{deposit !== null ? eth(deposit) : "—"}</p>
            <p className="receipt-note">
              {deposit !== null
                ? <>You will lock <strong>{eth(deposit)}</strong> now.</>
                : "Enter a payment to see the deposit."}
            </p>
            <ul>
              <li><span>Type</span><strong>{PROJECT_TYPES[type]}</strong></li>
              <li><span>Payment</span><strong>{amount ? `${amount} ETH` : "—"}</strong></li>
              <li><span>Deadline</span><strong>{deadline ? new Date(deadline).toLocaleString() : "—"}</strong></li>
            </ul>
            <button className="btn btn-primary" disabled={busy || !valid}>Create project</button>
          </aside>
        </form>
      </section>

      <section className="projects">
        <div className="section-head">
          <h2>Your projects</h2>
          <button className="btn" onClick={reload} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
        </div>

        {!loading && mine.length === 0 && <p className="empty">No projects yet. Create one above and freelancers can start applying.</p>}

        <div className="grid">
          {mine.map((p) => (
            <ProjectCard key={p.id} p={p} maxRejects={limits?.maxRejects}>
              {descriptions[p.id] && (
                <div className="task-description">
                  <strong>Task Description:</strong>
                  <p>{descriptions[p.id]}</p>
                </div>
              )}

              {p.status === STATUS.OPEN && (
                <>
                  <div className="applicants">
                    <h4>Applicants ({p.applicants.length}{limits ? ` of ${limits.maxApplicants}` : ""})</h4>
                    {p.applicants.length === 0 && <p className="hint">Nobody has applied yet.</p>}
                    {p.applicants.map((a) => (
                      <div className="applicant" key={a}>
                        <span title={a}>{short(a)}</span>
                        <button className="btn btn-small" disabled={busy}
                          onClick={() => act("Select freelancer", () => contract.selectFreelancer(p.id, a))}>
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-danger" disabled={busy}
                    onClick={() => act("Cancel project", () => contract.cancelOpenProject(p.id))}>
                    Cancel project
                  </button>
                </>
              )}

              {p.status === STATUS.IN_PROGRESS && (
                p.deadline * 1000 < now ? (
                  <button className="btn btn-danger" disabled={busy}
                    onClick={() => act("Claim missed deadline", () => contract.claimMissedDeadline(p.id))}>
                    Claim missed deadline
                  </button>
                ) : <p className="hint">Waiting for the freelancer to submit.</p>
              )}

              {p.status === STATUS.SUBMITTED && (
                <>
                  <p className="hint">
                    Work submitted. It auto-approves in {fmtDuration(p.countdown ?? 0)} if you don’t respond.
                  </p>
                  {(() => {
                    try {
                      const links = JSON.parse(localStorage.getItem("project_submission_links") || "{}");
                      const link = links[p.id];
                      return link ? (
                        <div style={{ margin: "0.5rem 0", padding: "0.5rem", background: "rgba(0,0,0,0.03)", borderRadius: "4px" }}>
                          <strong>Submission Link:</strong>{" "}
                          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary, #0070f3)", wordBreak: "break-all" }}>
                            {link}
                          </a>
                        </div>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
                  <button className="btn btn-primary" disabled={busy}
                    onClick={() => act("Approve work", () => contract.approveWork(p.id))}>
                    Approve and pay
                  </button>
                  <button className="btn" disabled={busy}
                    onClick={() => act("Reject work", () => contract.rejectWork(p.id))}>
                    Reject
                  </button>
                </>
              )}
            </ProjectCard>
          ))}
        </div>
      </section>

      <section className="protect" aria-labelledby="protect-title">
        <h2 id="protect-title">How the contract protects you</h2>
        <p className="protect-sub">
          Hiring a stranger should not feel like a gamble. These guarantees are written into the smart contract
          and apply to every project you post.
        </p>

        <ul className="protect-grid">
          {protections.map((r) => (
            <li key={r.title} className={`rule rule-${r.color}`}>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </li>
          ))}
        </ul>

        <div className="tips">
          <h3>Write a brief freelancers can say yes to</h3>
          <ul>
            <li>List the exact deliverables, so approval is a simple yes or no.</li>
            <li>Set a realistic deadline. Rushed projects attract fewer, weaker applicants.</li>
            <li>Check your projects regularly, because unanswered submissions auto-approve.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}