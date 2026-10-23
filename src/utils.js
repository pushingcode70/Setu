// src/utils.js
import { formatEther } from "ethers";

export const short = (a = "") => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
export const same = (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
export const eth = (wei) => {
  const n = Number(formatEther(wei ?? 0n));
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 5 })} ETH`;
};
export const fmtDate = (unix) => (unix ? new Date(Number(unix) * 1000).toLocaleString() : "—");
export const fmtDuration = (secs) => {
  secs = Number(secs);
  if (secs <= 0) return "now";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return [d && `${d}d`, h && `${h}h`, !d && `${m}m`].filter(Boolean).join(" ") || "<1m";
};
export const errMsg = (e) =>
  e?.reason || e?.shortMessage || e?.info?.error?.message || e?.message || "Transaction failed";