// src/context/WalletContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { ABI, CONTRACT_ADDRESS, SEPOLIA } from "../contract";
import { errMsg } from "../utils";
import "../Components/ui.css";

const WalletContext = createContext(null);
export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainOk, setChainOk] = useState(true);
  const [toast, setToast] = useState(null); // {type, text}
  const [busy, setBusy] = useState(false);

  const setup = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    setChainOk(Number(net.chainId) === SEPOLIA.chainId);
    const signer = await provider.getSigner();
    setAccount(await signer.getAddress());
    setContract(new Contract(CONTRACT_ADDRESS, ABI, signer));
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setToast({ type: "error", text: "No wallet found. Install MetaMask to continue." });
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA.hex }],
        });
      } catch (e) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: SEPOLIA.hex,
              chainName: "Sepolia",
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        }
      }
      await setup();
    } catch (e) {
      setToast({ type: "error", text: errMsg(e) });
    }
  }, [setup]);

  // auto-reconnect + react to wallet changes
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((a) => a.length && setup());
    const reload = () => window.location.reload();
    window.ethereum.on("accountsChanged", reload);
    window.ethereum.on("chainChanged", reload);
    return () => {
      window.ethereum.removeListener("accountsChanged", reload);
      window.ethereum.removeListener("chainChanged", reload);
    };
  }, [setup]);

  // run(label, () => contract.fn(...), onDone): sends the tx, waits, shows the result
  const run = useCallback(async (label, fn, onDone) => {
    setBusy(true);
    setToast({ type: "info", text: `${label}: confirm in your wallet…` });
    try {
      const tx = await fn();
      setToast({ type: "info", text: `${label}: waiting for confirmation…` });
      await tx.wait();
      setToast({ type: "ok", text: `${label}: done` });
      if (onDone) await onDone();
      return true;
    } catch (e) {
      setToast({ type: "error", text: `${label}: ${errMsg(e)}` });
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!toast || toast.type === "info") return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(
    () => ({ account, contract, chainOk, connect, run, busy }),
    [account, contract, chainOk, connect, run, busy]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      {toast && <div className={`toast toast-${toast.type}`} role="status">{toast.text}</div>}
    </WalletContext.Provider>
  );
}

// Wrap a page in this to require a wallet on Sepolia
export function ConnectGate({ children }) {
  const { account, chainOk, connect } = useWallet();
  if (!account || !chainOk) {
    return (
      <div className="gate">
        <h2>{account ? "Switch to Sepolia" : "Connect your wallet"}</h2>
        <p>Setu runs on the Sepolia test network. Use test ETH only.</p>
        <button className="btn btn-primary" onClick={connect}>
          {account ? "Switch network" : "Connect wallet"}
        </button>
      </div>
    );
  }
  return children;
}