import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLotteryImageByName } from "../components/LotteryCard";
import heroBanner from "../assets/hero-banner.png";
import "../styles/Home.css";

const todaysDraws = [
  {
    id: "state-win-win",
    name: "Win Win",
    time: "2:00 PM",
    drawPill: "Draw 2:00 PM",
    route: "/lottery?lotteryId=state-win-win",
    accent: "purple",
  },
  {
    id: "state-sthree",
    name: "Sthree Sakthi",
    time: "4:00 PM",
    drawPill: "Draw 4:00 PM",
    route: "/lottery?lotteryId=state-sthree",
    accent: "purple",
  },
  {
    id: "state-nagaland-day",
    name: "Nagaland Day",
    time: "6:00 PM",
    drawPill: "Draw 6:00 PM",
    route: "/lottery?lotteryId=state-nagaland-day",
    accent: "purple",
  },
];

const quickActions = [
  { id: "home", label: "Home", icon: "home", path: "/home" },
  { id: "wallet", label: "Wallet", icon: "wallet", path: "/wallet" },
  { id: "add-cash", label: "Add Cash", icon: "add", path: "/wallet?mode=add" },
  { id: "results", label: "Results", icon: "results", path: "/results" },
];

function padTime(value) {
  return String(value).padStart(2, "0");
}

function getNextDrawTarget(hour = 15, minute = 0) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

function useCountdown(targetTime) {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetTime - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetTime]);

  return remaining;
}

function QuickActionIcon({ type }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Zm14 4.5h3v3h-3a1.5 1.5 0 1 1 0-3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "add") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v16l-5-3-5 3V4Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();
  const drawTarget = useMemo(() => getNextDrawTarget(15, 0), []);
  const countdown = useCountdown(drawTarget);

  return (
    <div className="home-screen">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1 className="home-hero-title">How to play &amp; Win Big!</h1>
          <p className="home-hero-subtitle">Play more, win more</p>
          <button type="button" className="home-hero-cta" onClick={() => navigate("/lottery")}>
            Play Now
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="home-hero-art-wrap" aria-hidden="true">
          <img
            src={heroBanner}
            alt=""
            className="home-hero-art"
            width={399}
            height={190}
            decoding="async"
          />
        </div>
      </section>

      <section
        className="home-live-card"
        onClick={() => navigate("/lottery?lotteryId=state-kerala-bumper")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate("/lottery?lotteryId=state-kerala-bumper")}
      >
        <div className="home-live-icon-wrap">
          <img src={getLotteryImageByName("Kerala Lottery")} alt="" className="home-live-icon" />
        </div>
        <div className="home-live-info">
          <div className="home-live-name">Kerala Lottery</div>
          <div className="home-live-meta">Today, 3:00 PM</div>
          <span className="home-live-badge">LIVE DRAW</span>
        </div>
        <div className="home-live-countdown" aria-label="Countdown to draw">
          <div className="home-live-countdown-box">
            <div className="home-live-countdown-digits">
              {padTime(countdown.hours)} : {padTime(countdown.minutes)} : {padTime(countdown.seconds)}
            </div>
            <div className="home-live-countdown-labels">
              <span>HRS</span>
              <span>MIN</span>
              <span>SEC</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Today&apos;s Draws</h2>
          <button type="button" className="home-section-link" onClick={() => navigate("/lottery")}>
            View All
          </button>
        </div>

        <div className="home-draws-row">
          {todaysDraws.map((draw) => (
            <article key={draw.id} className={`home-draw-card home-draw-card--${draw.accent}`}>
              <div className={`home-draw-top home-draw-top--${draw.accent}`}>{draw.drawPill}</div>
              <div className="home-draw-body">
                <h3 className="home-draw-name">{draw.name}</h3>
                <div className="home-draw-time">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                  {draw.time}
                </div>
                <img
                  src={getLotteryImageByName(draw.name)}
                  alt=""
                  className="home-draw-art"
                  loading="lazy"
                />
                <button
                  type="button"
                  className={`home-draw-cta home-draw-cta--${draw.accent}`}
                  onClick={() => navigate(draw.route)}
                >
                  Play Now
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`home-quick-action ${action.id === "home" ? "is-active" : ""}`}
            onClick={() => navigate(action.path)}
          >
            <span className="home-quick-action-icon">
              <QuickActionIcon type={action.icon} />
            </span>
            <span className="home-quick-action-label">{action.label}</span>
          </button>
        ))}
      </section>

      <section
        className="home-trust-card"
        onClick={() => navigate("/about")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate("/about")}
      >
        <div className="home-trust-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3 4 6.5V11c0 4.7 3.4 8.8 8 10.5 4.6-1.7 8-5.8 8-10.5V6.5L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m9.5 12 1.8 1.8L15.5 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="home-trust-copy">
          <strong>Play Safe. Play Legal.</strong>
          <span>100% Secure &amp; Trusted</span>
        </div>
        <span className="home-trust-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </section>
    </div>
  );
}

export default Home;
