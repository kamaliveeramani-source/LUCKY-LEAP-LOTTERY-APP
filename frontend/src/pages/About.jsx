import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
      <div className="page-content">
        <div className="card-panel card-panel-strong" style={{ marginBottom: "18px" }}>
          <div className="badge-pill" style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)", color: "#fff" }}>
            About Us
          </div>
          <h2 style={{ margin: "16px 0 10px" }}>Thumbi Lotteries</h2>
          <p className="text-muted">
            Thumbi Lotteries is your fast, festive lottery play experience. Buy tickets, track draws, and manage wallet balances in one polished mobile-style app.
          </p>
        </div>

        <div className="card-panel card-panel-strong" style={{ marginBottom: "18px" }}>
          <h3 style={{ marginBottom: "14px" }}>What we offer</h3>
          <ul style={{ paddingLeft: "20px", margin: 0, color: "var(--text-secondary)" }}>
            <li>Instant access to Kerala, Nagaland and festival lottery draws.</li>
            <li>Fast ticket purchase and clear prize information.</li>
            <li>Wallet management, draw reminders, and promotions.</li>
            <li>Easy-to-use mobile-first interface for a smooth betting flow.</li>
          </ul>
        </div>

        <div className="card-panel card-panel-strong" style={{ marginBottom: "18px" }}>
          <h3 style={{ marginBottom: "14px" }}>Download the App</h3>
          <p className="text-muted">Use the mobile web app now. Native download links will be available soon for Android and iOS.</p>

          <div className="download-buttons">
            <button type="button" className="btn btn-gradient-primary btn-pill download-button" onClick={() => navigate("/")}>
              Android
            </button>
            <button type="button" className="btn btn-gradient-secondary btn-pill download-button" onClick={() => navigate("/")}>
              iOS
            </button>
          </div>
          <p className="text-muted" style={{ marginTop: "14px" }}>
            Open the app on your phone and enjoy quick ticket purchase, wallet top-up, and live draw updates.
          </p>
        </div>
      </div>
  );
}

export default About;
