function WalletCard({ wallet, refreshWallet, loading, error }) {
  // `wallet` may be an object with fields or a number fallback
  const w = typeof wallet === "object" && wallet !== null ? wallet : { wallet: Number(wallet || 0) };
  return (
    <div className="surface-bright rounded-3 p-4" style={{ color: "var(--text)", marginBottom: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 style={{ margin: 0 }}>💰 My Wallet</h5>
          <small className="text-muted">Cash Balance</small>
        </div>

        <button
          className="btn btn-sm btn-gradient-primary btn-pill"
          style={{ padding: "5px 15px" }}
          type="button"
          onClick={refreshWallet}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>


      {error ? (
        <div className="text-danger" style={{ marginBottom: "12px" }}>{error}</div>
      ) : null}

      <h1 className="accent-text" style={{ fontWeight: "bold" }}>
        ₹ {w.wallet?.toLocaleString?.() ?? Number(w.wallet).toFixed(2)}
      </h1>

      <div className="d-flex justify-content-between mt-3">
        <span>Bonus</span>

        <strong>₹ {w.bonus?.toLocaleString?.() ?? Number(w.bonus).toFixed(2)}</strong>
      </div>

      <div className="d-flex justify-content-between mt-2">
        <span>Winning</span>
        <strong>₹ {w.winning?.toLocaleString?.() ?? Number(w.winning).toFixed(2)}</strong>
      </div>

      <button
        className="btn w-100 mt-4 btn-gradient-primary"
        style={{
          fontWeight: "bold",
          borderRadius: "12px",
          height: "50px",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        Add Cash
      </button>
    </div>
  );
}

export default WalletCard;