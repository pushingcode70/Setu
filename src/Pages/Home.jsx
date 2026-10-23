import React from "react";

// Put your image in the /public folder and update the filename here.
const HERO_IMAGE = "/salman-wanted-dialogue.webp";

const steps = [
  {
    title: "Client deposits",
    text: "The client locks the agreed amount in the smart contract.",
    icon: "wallet",
  },
  {
    title: "Funds held in escrow",
    text: "Neither side can touch the money while work is in progress.",
    icon: "lock",
  },
  {
    title: "Work delivered",
    text: "The freelancer submits the finished work for review.",
    icon: "check",
  },
  {
    title: "Payment released",
    text: "On approval, the contract sends the funds to the freelancer.",
    icon: "send",
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
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
          <h1>
            A Trustless System.
            <br />
            Commit to Your Commitments.
          </h1>

          <div className="flow" aria-label="How payment moves from client to freelancer">
            <h2>How payment moves from client to freelancer</h2>
            <ol>
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="badge">
                    <Icon name={s.icon} />
                  </span>
                  <div>
                    <h3>
                      {i + 1}. {s.title}
                    </h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="hero-image">
          <img src={HERO_IMAGE} alt="Client and freelancer committing to an agreement" />
        </div>
      </section>
    </main>
  );
}

const css = `
.home {
  --text: #f4f4f4;
  --muted: #9b9b9b;
  --bg: #000000;
  --surface: #141414;
  --gold: #d9a21b;
  --line: #2b2b2b;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
}
.home * { box-sizing: border-box; }

.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
}

.hero-text h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 4.2vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
  margin: 0 0 40px;
}

.flow h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--muted);
  margin: 0 0 16px;
}
.flow ol {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.flow li {
  display: flex;
  gap: 16px;
  padding-bottom: 22px;
  position: relative;
}
.flow li:last-child { padding-bottom: 0; }
/* connecting line between steps */
.flow li:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 21px;
  top: 44px;
  bottom: 0;
  width: 2px;
  background: var(--line);
}
.badge {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--line);
}
.flow li:last-child .badge { background: var(--gold); color: #000; border-color: var(--gold); }
.flow h3 { margin: 2px 0 2px; font-size: 1.02rem; }
.flow p { margin: 0; color: var(--muted); font-size: 0.94rem; line-height: 1.45; max-width: 44ch; }

.hero-image img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: cover;
  border-radius: 32px; /* curved edges */
  border: 1px solid var(--line);
  box-shadow: 0 24px 60px -24px rgba(255, 255, 255, 0.12);
}

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; gap: 40px; padding: 40px 20px; }
  .hero-image { order: -1; }
  .hero-image img { max-height: 340px; }
}
`;