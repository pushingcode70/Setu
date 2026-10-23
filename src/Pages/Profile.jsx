// src/Pages/Profile.jsx  (manage stake, view eligibility)
import { useEffect, useState } from "react";
import { parseEther } from "ethers";
import { ConnectGate, useWallet } from "../context/WalletContext";
import useProjects from "../hooks/useProjects";
import { PROJECT_TYPES } from "../contract";
import { eth } from "../utils";
import "./Profile.css";

export default function Profile() {
  return (
    <ConnectGate>
      <ProfileInner />
    </ConnectGate>
  );
}

function ProfileInner() {
  const { account, contract, run, busy } = useWallet();
  const { limits } = useProjects();
  const [staked, setStaked] = useState(0n);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [eligible, setEligible] = useState([]);

  useEffect(() => {
    (async () => {
      const prof = await contract.profiles(account);
      setStaked(prof.stakedAmount);
      setEligible(await Promise.all(PROJECT_TYPES.map((_, i) => contract.meetsStakeRequirement(account, i))));
    })().catch(() => {});
  }, [contract, account]);

  const deposit = (e) => {
    e.preventDefault();
    run(
      "Deposit stake",
      () => contract.depositStake({ value: parseEther(depositAmount) }),
      () => { setDepositAmount(""); }
    );
  };

  const withdraw = (e) => {
    e.preventDefault();
    run(
      "Withdraw stake",
      () => contract.withdrawStake(parseEther(withdrawAmount)),
      () => { setWithdrawAmount(""); }
    );
  };

  const medium = limits?.mediumStake ?? 0n;
  const large = limits?.largeStake ?? 0n;
  const percent = medium > 0n ? Math.min(100, Number((staked * 100n) / medium)) : 0;

  return (
    <main className="page profile">
      <h1>Profile</h1>
      <p className="lede">Manage your stake to unlock project types and build trust.</p>

      <section className="card">
        <h2>Your stake</h2>
        <div className="stats">
          <p className="stat">
            <span className="label">Staked</span>
            <strong>{eth(staked)}</strong>
          </p>
          <p className="stat">
            <span className="label">Medium threshold</span>
            <strong>{eth(medium)}</strong>
          </p>
          <p className="stat">
            <span className="label">Large threshold</span>
            <strong>{eth(large)}</strong>
          </p>
        </div>

        <div className="meter">
          <div className="meter-fill" style={{ width: `${percent}%` }} />
          <div className="meter-mark" style={{ left: `${Math.min(100, Number((medium * 100n) / (medium || 1n)))}%` }} />
          <div className="meter-mark" style={{ left: `${Math.min(100, Number((large * 100n) / (large || 1n)))}%` }} />
        </div>
        <div className="meter-legend">
          <span>0</span>
          <span>Medium ({eth(medium)})</span>
          <span>Large ({eth(large)})</span>
        </div>

        <h3>Eligible for</h3>
        <ul className="tier-list">
          {PROJECT_TYPES.map((t, i) => (
            <li key={t} className={eligible[i] ? "ok" : "locked"}>
              {eligible[i] ? "✓" : "🔒"} {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Manage stake</h2>
        <div className="stake-forms">
          <form onSubmit={deposit}>
            <label>
              Deposit (ETH)
              <input type="number" min="0" step="any" placeholder="0.1" value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)} />
            </label>
            <button className="btn btn-primary" disabled={busy || !depositAmount}>
              Deposit
            </button>
          </form>

          <form onSubmit={withdraw}>
            <label>
              Withdraw (ETH)
              <input type="number" min="0" step="any" placeholder="0.1" value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)} />
            </label>
            <div className="row">
              <button className="btn btn-small" type="button" onClick={() => setWithdrawAmount(eth(staked).replace(" ETH", ""))}>
                Max
              </button>
              <button className="btn btn-danger" disabled={busy || !withdrawAmount || parseEther(withdrawAmount) > staked}>
                Withdraw
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}