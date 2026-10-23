import React from "react";

const steps = [
  {
    title: "Client deposits",
    text: "The client locks the agreed amount in a smart contract before any work begins. The terms, deadline and payout address are written on-chain, so everyone can see exactly what was promised.",
    icon: "wallet",
    color: "purple",
  },
  {
    title: "Funds held in escrow",
    text: "While the project is in progress, the money sits inside the contract. Neither the client nor the freelancer can withdraw it early, and no middleman ever holds it.",
    icon: "lock",
    color: "cyan",
  },
  {
    title: "Work delivered",
    text: "The freelancer submits the finished work for review. The client gets a clear window to check it against the agreed scope and request changes if needed.",
    icon: "check",
    color: "white",
  },
  {
    title: "Payment released",
    text: "Once the client approves, the contract sends the funds to the freelancer automatically. No invoices to chase and no waiting on a bank.",
    icon: "send",
    color: "yellow",
  },
];

const icons = {
  wallet: (
    <path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zm13 6h2" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  send: <path d="M4 12h15m-6-6l6 6-6 6" />,
};

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function Home() {
  return (
    <main className="home">
      <style>{css}</style>

      <section className="hero">
        <div className="hero-text">
          <div className="tags">
            <span className="tag tag-purple">Trustless escrow</span>
            <span className="tag tag-yellow">Powered by smart contracts</span>
          </div>

          <h1>
            A trustless system.
            <br />
            Commit to your commitments.
          </h1>

          <p className="lede">
            Hiring someone you have never met, or working for a client you have
            never worked with, always carries risk. Our escrow platform removes
            that risk: the money is locked in a smart contract that follows
            rules both sides agreed to up front, and it only moves when those
            rules are met.
          </p>
        </div>

        <aside className="vault" aria-label="Example escrow contract">
          <p className="vault-kicker">Contract status</p>
          <p className="vault-amount">$1,200</p>
          <p className="vault-note">Locked in escrow until the client approves</p>
          <ul>
            <li>
              <span>Client</span>
              <strong>Deposited</strong>
            </li>
            <li>
              <span>Freelancer</span>
              <strong>Working</strong>
            </li>
            <li>
              <span>Release</span>
              <strong>On approval</strong>
            </li>
          </ul>
        </aside>
      </section>

      <section className="flow" aria-labelledby="flow-title">
        <h2 id="flow-title">How payment moves from client to freelancer</h2>
        <p className="flow-sub">
          Four steps, enforced by code instead of promises. Here is what
          happens from the first deposit to the final payout.
        </p>

        <ol>
          {steps.map((s, i) => (
            <li key={s.title} className={`card card-${s.color}`}>
              <div className="card-top">
                <span className="badge">
                  <Icon name={s.icon} />
                </span>
                <span className="step-num">Step {i + 1}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap");

.home {
  --navy: #1a1033;
  --purple: #7c3aed;
  --cyan: #22d3ee;
  --yellow: #facc15;
  --paper: #ffffff;
  --shadow: 8px 8px 0 var(--navy);
  background: linear-gradient(135deg, #f7f3ff 0%, #f2f8ff 100%);
  color: var(--navy);
  min-height: 100vh;
  font-family: "Manrope", "Segoe UI", system-ui, sans-serif;
}
.home * { box-sizing: border-box; }

.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px 24px 40px;
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 48px;
  align-items: center;
}

.tags { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
.tag {
  display: inline-block;
  padding: 10px 16px;
  border: 3px solid var(--navy);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tag-purple { background: var(--purple); color: #fff; }
.tag-yellow { background: var(--yellow); color: var(--navy); }

.hero-text h1 {
  font-size: clamp(2.4rem, 5.6vw, 4.6rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.035em;
  margin: 0 0 28px;
}
.lede {
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 60ch;
  margin: 0;
}

/* dark vault card */
.vault {
  background: var(--navy);
  color: #fff;
  padding: 32px 28px;
  box-shadow: 8px 8px 0 var(--purple);
  border: 3px solid var(--navy);
}
.vault-kicker {
  margin: 0;
  color: var(--yellow);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.vault-amount {
  margin: 8px 0 4px;
  font-size: clamp(3rem, 6vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}
.vault-note { margin: 0 0 24px; font-size: 0.95rem; opacity: 0.8; }
.vault ul { list-style: none; margin: 0; padding: 0; border-top: 2px solid rgba(255,255,255,0.25); }
.vault li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 2px solid rgba(255,255,255,0.25);
  font-size: 0.95rem;
}
.vault li span { opacity: 0.75; }
.vault li strong { color: var(--cyan); }

/* steps */
.flow {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 96px;
}
.flow h2 {
  font-size: clamp(1.8rem, 3.6vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px;
}
.flow-sub { margin: 0 0 36px; font-size: 1.05rem; line-height: 1.6; max-width: 62ch; }

.flow ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
}
.card {
  border: 3px solid var(--navy);
  box-shadow: var(--shadow);
  padding: 24px 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-purple { background: var(--purple); color: #fff; }
.card-cyan   { background: var(--cyan);   color: var(--navy); }
.card-white  { background: var(--paper);  color: var(--navy); }
.card-yellow { background: var(--yellow); color: var(--navy); }

.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.badge {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  background: var(--navy);
  color: #fff;
  border: 3px solid var(--navy);
}
.step-num {
  background: var(--navy);
  color: #fff;
  padding: 6px 10px;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.card h3 { margin: 0; font-size: 1.45rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
.card p { margin: 0; font-size: 0.98rem; line-height: 1.55; }

@media (max-width: 1000px) {
  .flow ol { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 20px 24px; }
  .flow { padding: 24px 20px 72px; }
}
@media (max-width: 600px) {
  .flow ol { grid-template-columns: 1fr; }
}
`;