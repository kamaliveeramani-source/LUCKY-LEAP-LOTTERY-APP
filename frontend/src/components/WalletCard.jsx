import { useNavigate } from "react-router-dom";

function WalletCard({ wallet, refreshWallet, loading, error }) {
  const navigate = useNavigate();
  const w = typeof wallet === "object" && wallet !== null ? wallet : { wallet: Number(wallet || 0) };

  const balance = w.wallet?.toLocaleString?.() ?? Number(w.wallet).toFixed(2);
  const bonus = w.bonus?.toLocaleString?.() ?? Number(w.bonus || 0).toFixed(2);
  const winning = w.winning?.toLocaleString?.() ?? Number(w.winning || 0).toFixed(2);

  return (
    <div className="wallet-card-premium">
      <div className="wallet-card-premium-inner">
        <div className="wallet-card-premium-header">
          <div>
            <div className="wallet-card-premium-label">My Wallet</div>
            <div className="wallet-card-premium-balance">₹ {balance}</div>
          </div>
          <button
            type="button"
            className="wallet-refresh-btn"
            onClick={refreshWallet}
            disabled={loading}
            aria-label="Refresh wallet"
          >
            {loading ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {error ? (
          <div style={{ marginBottom: "12px", fontSize: "0.85rem", opacity: 0.95 }}>{error}</div>
        ) : null}

        <div className="wallet-card-premium-stats">
          <div className="wallet-card-premium-stat">
            <div className="wallet-card-premium-stat-label">Bonus</div>
            <div className="wallet-card-premium-stat-value">₹ {bonus}</div>
          </div>
          <div className="wallet-card-premium-stat">
            <div className="wallet-card-premium-stat-label">Winning</div>
            <div className="wallet-card-premium-stat-value">₹ {winning}</div>
          </div>
        </div>

        <div className="wallet-card-premium-actions">
          <button
            type="button"
            className="btn wallet-btn-ghost"
            onClick={() => navigate("/wallet")}
          >
            View Wallet
          </button>
          <button
            type="button"
            className="btn wallet-btn-solid"
            onClick={() => navigate("/wallet?mode=add")}
          >
            Add Money
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;
