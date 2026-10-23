import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

// Add as many pages as you want here
const LINKS = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/work" },
  { name: "Hire", path: "/hire" },
  { name: "Profile", path: "/profile" },

];

const shortAddress = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function Navbar({ photo, name = "Setu" }) {
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasMetaMask = typeof window !== "undefined" && Boolean(window.ethereum);

  // Restore session on reload
  useEffect(() => {
    if (!hasMetaMask) return;
    let wasLoggedIn = false;
    try {
      wasLoggedIn = localStorage.getItem("setu_wallet_connected") === "1";
    } catch (e) {}
    if (!wasLoggedIn) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => accounts[0] && setAccount(accounts[0]))
      .catch(() => {});
  }, [hasMetaMask]);

  // Keep in sync when MetaMask account changes
  useEffect(() => {
    if (!hasMetaMask) return;
    const onAccountsChanged = (accounts) => setAccount(accounts[0] || null);
    window.ethereum.on("accountsChanged", onAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", onAccountsChanged);
  }, [hasMetaMask]);

  const login = useCallback(async () => {
    setError("");
    if (!hasMetaMask) {
      setError("MetaMask isn't installed. Install it to log in.");
      return;
    }
    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      try {
        localStorage.setItem("setu_wallet_connected", "1");
      } catch (e) {}
    } catch (err) {
      setError(err?.code === 4001 ? "Connection request was rejected." : "Couldn't connect to MetaMask.");
    } finally {
      setConnecting(false);
    }
  }, [hasMetaMask]);

  const logout = useCallback(() => {
    setAccount(null);
    setError("");
    try {
      localStorage.removeItem("setu_wallet_connected");
    } catch (e) {}
  }, []);

  return (
    <header className="nav">
      <nav className="nav__inner" aria-label="Main">
        <Link className="nav__brand" to="/" aria-label={`${name} home`}>
          {photo ? (
            <img className="nav__photo" src={photo} alt={name} />
          ) : (
            <span className="nav__photo nav__photo--fallback" aria-hidden="true">
              {name.charAt(0)}
            </span>
          )}
          <span className="nav__name">{name}</span>
        </Link>

        <button
          className="nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="nav-menu" className={`nav__menu ${menuOpen ? "is-open" : ""}`}>
          <ul className="nav__links">
            {LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`nav__link ${isActive ? "is-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="nav__auth">
            {account ? (
              <>
                <span className="nav__wallet" title={account}>
                  <span className="nav__dot" aria-hidden="true" />
                  {shortAddress(account)}
                </span>
                <button className="btn btn--ghost" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <button className="btn btn--solid" onClick={login} disabled={connecting}>
                {connecting ? "Connecting…" : "Log in with MetaMask"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {error && (
        <p className="nav__error" role="alert">
          {error}
        </p>
      )}
    </header>
  );
}