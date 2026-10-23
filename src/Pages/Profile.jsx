// src/Pages/Work.jsx  (freelancer side: find projects, apply, submit work)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConnectGate, useWallet } from "../context/WalletContext";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../Components/ProjectCard";
import { PROJECT_TYPES, STATUS } from "../contract";
import { eth, fmtDuration, same } from "../utils";
import "./Work.css";

export default function Work() {
  return (
    <ConnectGate>
      <WorkInner />
    </ConnectGate>
  );
}

function WorkInner() {
  const { account, contract, run, busy } = useWallet();
  const { projects, limits, loading, reload } = useProjects();
  const [tab, setTab] = useState("browse");
  const [staked, setStaked] = useState(0n);
  const [eligible, setEligible] = useState([]); // meetsStakeRequirement per project type
  const [applied, setApplied] = useState({}); // projectId -> bool

  const open = projects.filter((p) => p.status === STATUS.OPEN && !same(p.client, account));
  const mine = projects.filter((p) => same(p.freelancer, account));
  const activeCount = mine.filter((p) => p.status === STATUS.IN_PROGRESS || p.status === STATUS.SUBMITTED).length;

  useEffect(() => {
    (async () => {
      const prof = await contract.profiles(account);
      setStaked(prof.stakedAmount);
      setEligible(await Promise.all(PROJECT_TYPES.map((_, i) => contract.meetsStakeRequirement(account, i))));
    })().catch(() => {});
  }, [contract, account, projects]);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(open.map(async (p) => [p.id, await contract.hasApplied(p.id, account)]));
      setApplied(Object.fromEntries(entries));
    })().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const act = (label, fn) => run(label, fn, reload);

  return (
    <main className="page work">
      <h1>Work</h1>
      <p className="lede">Apply to projects that match your stake, deliver, and get paid from escrow.</p>

      <section className="card stake-strip">
        <div>
          <span className="label">Your stake</span>
          <strong>{eth(staked)}</strong>
        </div>
        <div>
          <span className="label">Active projects</span>
          <strong>{activeCount}{limits ? ` of ${limits.maxActive}` : ""}</strong>
        </div>
        <div>
          <span className="label">You can take</span>
          <strong>
            {PROJECT_TYPES.filter((_, i) => eligible[i]).join(", ") || "Nothing yet"}
          </strong>
        </div>
        <Link className="btn" to="/profile">Manage stake</Link>
      </section>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "browse"} onClick={() => setTab("browse")}>
          Open projects ({open.length})
        </button>
        <button role="tab" aria-selected={tab === "mine"} onClick={() => setTab("mine")}>
          My work ({mine.length})
        </button>
        <button className="btn btn-small tabs-refresh" onClick={reload} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {tab === "browse" && (
        <>
          {!loading && open.length === 0 && <p className="empty">No open projects right now. Check back soon.</p>}
          <div className="grid">
            {open.map((p) => {
              const full = limits && p.applicants.length >= limits.maxApplicants;
              const lacksStake = eligible.length > 0 && !eligible[p.type];
              const reason = applied[p.id] ? "Applied"
                : lacksStake ? `Needs more stake for ${PROJECT_TYPES[p.type]}`
                : full ? "Applicant limit reached"
                : null;
              return (
                <ProjectCard key={p.id} p={p}>
                  <p className="hint">
                    {p.applicants.length}{limits ? ` of ${limits.maxApplicants}` : ""} applicants
                  </p>
                  <button className="btn btn-primary" disabled={busy || !!reason}
                    onClick={() => act("Apply", () => contract.applyForProject(p.id))}>
                    {reason ?? "Apply"}
                  </button>
                </ProjectCard>
              );
            })}
          </div>
        </>
      )}

      {tab === "mine" && (
        <>
          {!loading && mine.length === 0 && <p className="empty">You haven’t been selected for a project yet. Apply to one from the open list.</p>}
          <div className="grid">
            {mine.map((p) => (
              <ProjectCard key={p.id} p={p} maxRejects={limits?.maxRejects}>
                {p.status === STATUS.IN_PROGRESS && (
                  <button className="btn btn-primary" disabled={busy}
                    onClick={() => act("Submit work", () => contract.submitWork(p.id))}>
                    {p.rejectCount > 0 ? "Resubmit work" : "Submit work"}
                  </button>
                )}
                {p.status === STATUS.SUBMITTED && (
                  <>
                    <p className="hint">
                      {p.countdown > 0
                        ? `Waiting for the client. You can claim payment in ${fmtDuration(p.countdown)}.`
                        : "The client didn’t respond in time. You can claim payment."}
                    </p>
                    <button className="btn btn-primary" disabled={busy || p.countdown > 0}
                      onClick={() => act("Claim auto-approval", () => contract.claimAutoApproval(p.id))}>
                      Claim payment
                    </button>
                  </>
                )}
              </ProjectCard>
            ))}
          </div>
        </>
      )}
    </main>
  );
}