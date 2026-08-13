import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import LotteryCard from "../components/LotteryCard";
import "./GamePages.css";

const lotteryCards = [
  {
    id: "state-nagaland",
    name: "Nagaland Morning",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "13:00",
    countdown: "Today",
    status: "LIVE",
    ribbon: "NEW",
    winners: "12,450 Winners",
    sold: 76,
    route: "/lottery?lotteryId=state-nagaland",
  },
  {
    id: "state-sthree",
    name: "Sthree Sakthi",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "15:00",
    countdown: "2 Hours Left",
    status: "OPEN",
    ribbon: "HOT",
    winners: "9,280 Winners",
    sold: 64,
    route: "/lottery?lotteryId=state-sthree",
  },
  {
    id: "state-nagaland-day",
    name: "Nagaland Day",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "18:00",
    countdown: "Tomorrow",
    status: "CLOSING SOON",
    ribbon: "ENDING SOON",
    winners: "5,170 Winners",
    sold: 83,
    route: "/lottery?lotteryId=state-nagaland-day",
  },
  {
    id: "state-nagaland-evening",
    name: "Nagaland Evening",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "20:00",
    countdown: "2 Hours Left",
    status: "OPEN",
    ribbon: "HOT",
    winners: "10,020 Winners",
    sold: 69,
    route: "/lottery?lotteryId=state-nagaland-evening",
  },
  {
    id: "state-karunya",
    name: "Karunya",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 08",
    time: "15:00",
    countdown: "Tomorrow",
    status: "OPEN",
    ribbon: "NEW",
    winners: "7,340 Winners",
    sold: 58,
    route: "/lottery?lotteryId=state-karunya",
  },
  {
    id: "state-karunya-plus",
    name: "Karunya Plus",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 06",
    time: "15:00",
    countdown: "Today",
    status: "LIVE",
    ribbon: "HOT",
    winners: "14,840 Winners",
    sold: 91,
    route: "/lottery?lotteryId=state-karunya-plus",
  },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5L12 5l8 6.5V18a2 2 0 0 1-2 2h-3v-7H9v7H6a2 2 0 0 1-2-2v-6.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Zm0 0h14.5m-12 5h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18V9m7 9V5m7 13v-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 18 6v5.8c0 3.7-2.4 7.1-6 9.7-3.6-2.6-6-6-6-9.7V6l6-2.5Zm-4 8.2 2.4 2.4 4.6-4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const quickActions = [
  { label: "Home", icon: <HomeIcon />, path: "/home" },
  { label: "Wallet", icon: <WalletIcon />, path: "/wallet" },
  { label: "Add Cash", icon: <WalletIcon />, path: "/add-cash", emphasis: true },
  { label: "Results", icon: <ChartIcon />, path: "/results" },
];

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();
  const featuredLottery = lotteryCards[0];

  const countdown = "02:15:30";
  const countdownUnits = [
    { label: "HRS", value: countdown.split(":")[0] },
    { label: "MIN", value: countdown.split(":")[1] },
    { label: "SEC", value: countdown.split(":")[2] },
  ];

  return (
    <div className="page-content home-page-shell">
      <section className="emerald-hero-card">
        <div className="hero-badge-row">
          <span className="hero-live-pill">Live draw</span>
          <span className="hero-chip">Today</span>
        </div>

        <div className="hero-content-row">
          <div className="hero-copy">
            <h1>How to play &amp; Win Big!</h1>
            <p>Play more, win more.</p>
            <div className="hero-cta-row">
              <button type="button" className="btn btn-primary-custom hero-primary-btn" onClick={() => navigate("/lottery")}>
                Play Now
              </button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-machine">
              <div className="hero-machine-top" />
              <div className="hero-machine-glass">
                <div className="hero-ball ball-one">7</div>
                <div className="hero-ball ball-two">9</div>
                <div className="hero-ball ball-three">3</div>
                <div className="hero-ball ball-four">1</div>
                <div className="hero-ball ball-five">7</div>
              </div>
              <div className="hero-machine-base" />
            </div>
            <div className="hero-coin coin-one" />
            <div className="hero-coin coin-two" />
            <div className="hero-coin coin-three" />
          </div>
        </div>
      </section>

      <section className="live-lottery-panel home-panel">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">Live Lottery</div>
            <h3>{featuredLottery.name}</h3>
          </div>
          <button type="button" className="text-link-btn" onClick={() => navigate("/lottery")}>View All</button>
        </div>

        <div className="live-lottery-card" onClick={() => navigate(`/lottery?lotteryId=${featuredLottery.id}`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate(`/lottery?lotteryId=${featuredLottery.id}`)}>
          <div className="live-lottery-main">
            <div className="live-lottery-visual" aria-hidden="true">🎟</div>
            <div className="live-lottery-copy">
              <div className="live-top-row">
                <span className="live-badge">Live draw</span>
                <span className="live-date-label">Today, 3:00 PM</span>
              </div>
              <h4>{featuredLottery.name}</h4>
              <div className="live-lottery-stats">
                <span>Prize: {featuredLottery.prize}</span>
                <span>Ticket: ₹{featuredLottery.price}</span>
              </div>
            </div>
          </div>

          <div className="countdown-block" aria-label="Countdown timer">
            {countdownUnits.map((unit) => (
              <div key={unit.label} className="countdown-unit">
                <span className="countdown-label">{unit.label}</span>
                <span className="countdown-value">{unit.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="today-draws-panel home-panel">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">Today’s Draws</div>
            <h3>Lucky picks</h3>
          </div>
          <button type="button" className="text-link-btn" onClick={() => navigate("/lottery")}>View All</button>
        </div>

        <div className="today-draws-grid">
          {lotteryCards.slice(0, 3).map((lottery) => (
            <article key={lottery.id} className="today-draw-card">
              <div className="today-draw-header">
                <span className="draw-badge">Draw {lottery.time}</span>
              </div>
              <h4>{lottery.name}</h4>
              <div className="today-draw-time">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 3.5v3.4l2.5 1.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {lottery.time}
              </div>
              <button type="button" className="today-draw-button" onClick={() => navigate(lottery.route)}>
                Play Now
                <ArrowIcon />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="quick-actions-panel home-panel">
        <div className="quick-action-grid">
          {quickActions.map((item) => (
            <button key={item.label} type="button" className={`quick-action-card ${item.emphasis ? "emphasis" : item.path === "/home" ? "active" : ""}`} onClick={() => navigate(item.path)}>
              <span className="quick-action-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="trust-card home-panel">
        <div className="trust-icon"><ShieldIcon /></div>
        <div className="trust-copy">
          <h4>Play Safe. Play Legal.</h4>
          <p>100% Secure &amp; Trusted</p>
        </div>
        <div className="trust-arrow"><ArrowIcon /></div>
      </section>
    </div>
  );
}

export default Home;
