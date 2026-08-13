import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  return (
      <div className="page-content">

        <div className="home-section-title">
          <div className="section-label">App Settings</div>
          <div className="section-note">Customize your experience, notifications, and security preferences.</div>
        </div>

        <div className="lottery-section" style={{ display: "grid", gap: "14px" }}>
          <button type="button" className="home-card" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
            <div>
              <div className="home-card-title">Notifications</div>
              <div className="home-card-subtitle">Manage alert preferences, draw reminders, and sound settings.</div>
            </div>
          </button>

          <button type="button" className="home-card" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)" }}>
            <div>
              <div className="home-card-title">Security</div>
              <div className="home-card-subtitle">Update your password, enable two-factor authentication, and secure your account.</div>
            </div>
          </button>

          <button type="button" className="home-card" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}>
            <div>
              <div className="home-card-title">Payment & Wallet</div>
              <div className="home-card-subtitle">Choose your payment method, top-up options, and transaction preferences.</div>
            </div>
          </button>

          <button type="button" className="home-card" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }}>
            <div>
              <div className="home-card-title">Personalization</div>
              <div className="home-card-subtitle">Select your preferred theme, language, and app layout settings.</div>
            </div>
          </button>
        </div>
      </div>
  );
}

export default Settings;
