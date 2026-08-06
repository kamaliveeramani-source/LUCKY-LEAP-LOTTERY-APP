import { useNavigate } from "react-router-dom";

function Promotions() {
  const navigate = useNavigate();

  return (
      <div className="page-content">
        <div className="home-section-title">
          <div className="section-label">Latest Offers</div>
          <div className="section-note">Tap an offer to learn more and claim rewards.</div>
        </div>

        <div className="lottery-section">
          <div className="home-card-grid">
            <div className="home-card" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" }}>
              <div>
                <div className="home-card-title">Referral Bonus</div>
                <div className="home-card-subtitle">Invite friends and earn extra credits.</div>
              </div>
            </div>
            <div className="home-card" style={{ background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)" }}>
              <div>
                <div className="home-card-title">Daily Spin</div>
                <div className="home-card-subtitle">Play every day to unlock free spins.</div>
              </div>
            </div>
            <div className="home-card" style={{ background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)" }}>
              <div>
                <div className="home-card-title">Mega Cashback</div>
                <div className="home-card-subtitle">Get up to 15% cashback on selected bets.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Promotions;
