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
  const [deposit, setDeposit] = useState(null);

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

  const deadlineTs = deadline ? Math.floor(new Date(deadline).getTime() / 1000) : 0;
  const valid = deposit !== null && deadlineTs * 1000 > Date.now();

  const create = (e) => {
    e.preventDefault();
    const now = Math.floor(Date.now() / 1000);
    const dl = DEADLINE_MODE === "duration" ? deadlineTs - now : deadlineTs;
    run(
      "Create project",
      () => contract.createProject(type, parseEther(amount), dl, { value: deposit }),
      () => { setAmount(""); setDeadline(""); return reload(); }
    );
  };

  const mine = projects.filter((p) => same(p.client, account));
  const act = (label, fn) => run(label, fn, reload);
  const now = Date.now();

  return (
    <main className="page hire">
      <h1>Hire</h1>
      <p className="lede">Post a project, lock the payment in escrow, and choose who builds it.</p>

      <section className="card">
        <h2>New project</h2>
        <form className="form-grid" onSubmit={create}>
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
          <label>
            Deadline
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <div className="form-foot">
            <p className="hint">
              {deposit !== null
                ? <>You will lock <strong>{eth(deposit)}</strong> now.</>
                : "Enter a payment to see the deposit."}
            </p>
            <button className="btn btn-primary" disabled={busy || !valid}>Create project</button>
          </div>
        </form>
      </section>

      <section>
        <div className="section-head">
          <h2>Your projects</h2>
          <button className="btn" onClick={reload} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
        </div>

        {!loading && mine.length === 0 && <p className="empty">No projects yet. Create one above and freelancers can start applying.</p>}

        <div className="grid">
          {mine.map((p) => (
            <ProjectCard key={p.id} p={p} maxRejects={limits?.maxRejects}>
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
    </main>
  );
}