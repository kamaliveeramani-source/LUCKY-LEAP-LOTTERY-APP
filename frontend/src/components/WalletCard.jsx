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
            <div className="wallet-card-premium-label">💰 My Wallet</div>
            <div className="wallet-card-premium-balance">₹ {balance}</div>
          </div>
          <button
            type="button"
            className="wallet-refresh-btn"
            onClick={refreshWallet}
            disabled={loading}
            aria-label="Refresh wallet"
          >
            {loading ? "⏳" : "↻"}
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
