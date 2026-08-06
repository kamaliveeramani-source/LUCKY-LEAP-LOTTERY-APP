import { useNavigate } from "react-router-dom";

function MobileApp() {
  const navigate = useNavigate();

  return (
      <div className="page-content">
        <div className="text-center" style={{ marginBottom: "22px" }}>
          <div className="badge-pill">Mobile App</div>
          <h2 className="page-title" style={{ margin: "10px 0 8px", fontWeight: 800 }}>
            Play Lottery Anytime
          </h2>
          <p className="text-muted" style={{ margin: 0 }}>
            Download the Lucky Leap mobile experience to buy tickets, track draws, and manage your wallet on the go.
          </p>
        </div>

        <div className="card-panel card-panel-strong" style={{ marginBottom: "20px" }}>
          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <h4 style={{ color: "var(--accent)", marginBottom: "10px" }}>Why the Lucky Leap App?</h4>
              <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text)" }}>
                <li style={{ marginBottom: "8px" }}>Quick ticket purchase for Kerala state lotteries</li>
                <li style={{ marginBottom: "8px" }}>Live draw notifications and prize updates</li>
                <li style={{ marginBottom: "8px" }}>Instant wallet top-up and transaction tracking</li>
                <li style={{ marginBottom: "8px" }}>Secure login and fast betting flow</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-gradient-primary btn-pill"
                style={{ minWidth: "130px", padding: "12px 18px" }}
                onClick={() => navigate("/register")}
              >
                Sign Up Now
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-pill"
                style={{ minWidth: "130px", padding: "12px 18px" }}
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </div>
        </div>

        <div className="card-panel card-panel-strong" style={{ marginBottom: "20px" }}>
          <div style={{ display: "grid", gap: "18px" }}>
            <h4 style={{ color: "var(--accent)", marginBottom: "10px" }}>App Features</h4>
            <div className="feature-row">
              <strong>Instant Lottery Bets</strong>
              <p className="text-muted" style={{ margin: "6px 0 0" }}>Choose your game, place bets, and track your ticket in one tap.</p>
            </div>
            <div className="feature-row">
              <strong>Live Draw Alerts</strong>
              <p className="text-muted" style={{ margin: "6px 0 0" }}>Get notified instantly when results are declared.</p>
            </div>
            <div className="feature-row">
              <strong>Wallet Management</strong>
              <p className="text-muted" style={{ margin: "6px 0 0" }}>Top up, withdraw, or transfer funds with secure mobile access.</p>
            </div>
            <div className="feature-row">
              <strong>Smart History</strong>
              <p className="text-muted" style={{ margin: "6px 0 0" }}>See your past tickets, wins, and active entries anytime.</p>
            </div>
          </div>
        </div>

        <div className="card-panel card-panel-strong" style={{ padding: "24px 18px" }}>
          <h4 style={{ color: "var(--accent)", marginBottom: "12px" }}>Download the App</h4>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-outline-primary btn-pill"
              style={{ flex: 1, minWidth: "140px", padding: "12px 18px" }}
            >
              Android
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-pill"
              style={{ flex: 1, minWidth: "140px", padding: "12px 18px" }}
            >
              iOS
            </button>
          </div>
          <p className="text-muted" style={{ marginTop: "18px" }}>
            Coming soon: a fully native mobile app experience. Use the web app on your phone today to get started.
          </p>
        </div>
      </div>
  );
}

export default MobileApp;
