function Support() {
  return (
      <div className="page-content">
        <div className="home-section-title">
          <div className="section-label">Support</div>
          <div className="section-note">Get help with your account, wallet, or ticket purchase.</div>
        </div>

        <div className="card-panel card-panel-strong" style={{ marginBottom: "18px" }}>
          <h3 style={{ marginBottom: "12px" }}>How can we help?</h3>
          <p className="text-muted">
            Our support team is ready to assist you with withdrawals, ticket orders, balance issues, and draw questions.
          </p>
          <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
            <button type="button" className="btn btn-gradient-primary btn-pill">
              Contact Support
            </button>
            <button type="button" className="btn btn-outline-primary btn-pill">
              View FAQ
            </button>
          </div>
        </div>

        <div className="card-panel card-panel-strong">
          <h3 style={{ marginBottom: "12px" }}>Need faster support?</h3>
          <p className="text-muted" style={{ marginBottom: "10px" }}>
            Reach out at support@luckyleap.app or use the in-app chat for help with any issue.
          </p>
          <div className="home-card-grid" style={{ gridTemplateColumns: "1fr", gap: "14px" }}>
            <div className="home-card" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #9333ea 100%)" }}>
              <div className="home-card-title">Account Help</div>
              <div className="home-card-subtitle">Login, verification, and profile updates.</div>
            </div>
            <div className="home-card" style={{ background: "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)" }}>
              <div className="home-card-title">Wallet & Payments</div>
              <div className="home-card-subtitle">Top-up, withdraw, and transaction support.</div>
            </div>
            <div className="home-card" style={{ background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" }}>
              <div className="home-card-title">Ticket Orders</div>
              <div className="home-card-subtitle">Questions about draws, tickets, or prizes.</div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Support;
