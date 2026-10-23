// src/Components/ConnectButton.jsx (drop this into your Navbar)
import { useWallet } from "../context/WalletContext";
import { short } from "../utils";

export default function ConnectButton() {
  const { account, connect } = useWallet();
  return (
    <button className="btn btn-primary" onClick={connect}>
      {account ? short(account) : "Connect wallet"}
    </button>
  );
}