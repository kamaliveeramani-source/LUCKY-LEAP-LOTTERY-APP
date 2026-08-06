const fs = require('fs');
const homePath = 'c:\\Users\\kamal\\OneDrive\\Desktop\\lottery_app\\frontend\\src\\pages\\Home.jsx';
const bottomPath = 'c:\\Users\\kamal\\OneDrive\\Desktop\\lottery_app\\frontend\\src\\components\\BottomNav.jsx';
const homeContent = `import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

const categories = ["Dice", "Color", "3Digits", "State Lottery", "Car", "Kerala"];

const lotteryCards = [
  {
    title: "Nagaland Morning",
    jackpot: "₹9,60,000",
    draw: "Aug 04th 13:00",
    tag: "Dear 1 PM",
    bg: "linear-gradient(180deg, #4f9aff 0%, #1a5cd6 100%)",
  },
  {
    title: "Sthree Sakthi",
    jackpot: "₹9,60,000",
    draw: "Aug 04th 15:00",
    tag: "Quick 3D",
    bg: "linear-gradient(180deg, #9b5cff 0%, #5a28d8 100%)",
  },
  {
    title: "Nagaland Day",
    jackpot: "₹9,60,000",
    draw: "Aug 04th 18:00",
    tag: "Dear 6 PM",
    bg: "linear-gradient(180deg, #ff704d 0%, #d04322 100%)",
  },
  {
    title: "Nagaland Evening",
    jackpot: "₹9,60,000",
    draw: "Aug 04th 20:00",
    tag: "Dear 8 PM",
    bg: "linear-gradient(180deg, #ffbe39 0%, #fb8f00 100%)",
  },
  {
    title: "Dhanalakshmi",
    jackpot: "₹9,60,000",
    draw: "Aug 05th 15:00",
    tag: "Daily Jackpot",
    bg: "linear-gradient(180deg, #b74cff 0%, #8f2de0 100%)",
  },
  {
    title: "Karunya Plus",
    jackpot: "₹9,60,000",
    draw: "Aug 06th 15:00",
    tag: "Special",
    bg: "linear-gradient(180deg, #ff8a4c 0%, #d85d23 100%)",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-shell home-page">
      <div className="page-content">
        <div className="home-topbar">
          <div className="home-topbar-left">
            <button className="icon-btn" aria-label="Open menu">☰</button>
            <span className="home-topbar-title">Singham Lottery</span>
          </div>

          <div className="home-topbar-right">
            <button className="btn btn-gradient-primary btn-pill">LOGIN</button>
            <button className="icon-btn search-btn" aria-label="Search">🔍</button>
          </div>
        </div>

        <div className="home-tabs">
          {categories.map((category) => (
            <button key={category} className={`home-tab ${category === "State Lottery" ? "active" : ""}`} type="button">
              {category}
            </button>
          ))}
        </div>

        <div className="home-section-title">
          <div className="section-label">State Lottery</div>
          <div className="section-note">Popular draws, jackpot value, and next booking time.</div>
        </div>

        <div className="home-card-grid">
          {lotteryCards.map((lottery) => (
            <div key={lottery.title} className="home-card" style={{ background: lottery.bg }} onClick={() => navigate("/lottery")}>
              <div>
                <div className="home-card-tag">{lottery.tag}</div>
                <div className="home-card-title">{lottery.title}</div>
                <div className="home-card-jackpot">{lottery.jackpot}</div>
                <div className="home-card-subtitle">Jackpot</div>
              </div>
              <div className="home-card-draw">Next Draw {lottery.draw}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Home;
`;
const bottomContent = `import { Link, useLocation } from "react-router-dom";

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive("/") ? "active" : ""}>
        🏠
        <br />
        Home
      </Link>

      <Link to="/lottery" className={isActive("/lottery") ? "active" : ""}>
        🎲
        <br />
        Earn
      </Link>

      <Link to="/wallet" className={`fab ${isActive("/wallet") ? "active" : ""}`}>
        <span>₹200</span>
      </Link>

      <Link to="/results" className={isActive("/results") ? "active" : ""}>
        🎁
        <br />
        Promos
      </Link>

      <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
        👤
        <br />
        Me
      </Link>
    </nav>
  );
}

export default BottomNav;
`;
fs.writeFileSync(homePath, homeContent, 'utf8');
fs.writeFileSync(bottomPath, bottomContent, 'utf8');
console.log('wrote');
