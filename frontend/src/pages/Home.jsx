import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroArtwork from "../assets/hero-artwork.png";
import keralaEmblem from "../assets/lotteries/kerala-emblem-white.png";
import lotteryBowlWatermark from "../assets/thumbi-bowl.png";
import "../styles/Home.css";

const todaysDraws = [
  {
    id: "state-win-win",
    name: "Win Win",
    time: "1:00 PM",
    drawPill: "Draw 2:00 PM",
    route: "/lottery?lotteryId=state-win-win",
    variant: "purple",
  },
  {
    id: "state-akshaya",
    name: "Akshaya",
    time: "6:00 PM",
    drawPill: "Draw 6:00 PM",
    route: "/lottery?lotteryId=state-akshaya",
    variant: "orange",
  },
  {
    id: "state-karunya-plus",
    name: "Karunya Plus",
    time: "8:00 PM",
    drawPill: "Draw 8:00 PM",
    route: "/lottery?lotteryId=state-karunya-plus",
    variant: "blue",
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

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickActionIcon({ type }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 10.75 12 4.5l8 6.25V20a1.25 1.25 0 0 1-1.25 1.25H15v-6.5H9v6.5H5.25A1.25 1.25 0 0 1 4 20v-9.25Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 8.25A2.25 2.25 0 0 1 6.25 6h11.5A2.25 2.25 0 0 1 20 8.25V9h1a2.25 2.25 0 0 1 2.25 2.25v6.5A2.25 2.25 0 0 1 20.75 20H4V8.25Zm15.75 4.5h-3.25a1.75 1.75 0 1 0 0 3.5H19.75v-3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (type === "add") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 4h4v7h7v4h-7v7h-4v-7H3v-4h7V4Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="12" width="3.75" height="8" rx="1.1" fill="currentColor" />
      <rect x="10.125" y="8" width="3.75" height="12" rx="1.1" fill="currentColor" />
      <rect x="15.75" y="4.5" width="3.75" height="15.5" rx="1.1" fill="currentColor" />
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
        <div className="home-hero__content">
          <h1>
            How to play &amp;
            <br />
            Win Big!
          </h1>
          <p>Play more, win more</p>
          <button type="button" className="hero-play-btn" onClick={() => navigate("/lottery")}>
            Play Now <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="home-hero__art" aria-hidden="true">
          <img src={heroArtwork} alt="Thumbi lottery draw machine with gold coins" />
        </div>
      </section>

      <div
        className="live-draw-card"
        onClick={() => navigate("/lottery?lotteryId=state-kerala-bumper")}
        onKeyDown={(e) => e.key === "Enter" && navigate("/lottery?lotteryId=state-kerala-bumper")}
        role="button"
        tabIndex={0}
      >
        <div className="live-draw-left">
          <div className="live-draw-emblem">
            <img src={keralaEmblem} alt="Kerala Lottery" />
          </div>

          <div className="live-draw-info">
            <h3>Kerala Lottery</h3>
            <p>Today, 3:00 PM</p>
            <span className="live-pill">LIVE DRAW</span>
          </div>
        </div>

        <div className="live-draw-timer" aria-label="Countdown to draw">
          <div className="timer-values">
            <span>{padTime(countdown.hours)}</span>
            <span>:</span>
            <span>{padTime(countdown.minutes)}</span>
            <span>:</span>
            <span>{padTime(countdown.seconds)}</span>
          </div>

          <div className="timer-labels">
            <span>HRS</span>
            <span>MIN</span>
            <span>SEC</span>
          </div>
        </div>
      </div>

      <div className="todays-draws-header">
        <h2>Today&apos;s Draws</h2>
        <button type="button" onClick={() => navigate("/lottery")}>
          View All
        </button>
      </div>

      <div className="draws-grid">
        {todaysDraws.map((draw) => (
          <div key={draw.id} className={`draw-card draw-card--${draw.variant}`}>
            <div className="draw-card__badge">{draw.drawPill}</div>

            <h3>{draw.name}</h3>

            <div className="draw-card__time">
              <ClockIcon />
              <span>{draw.time}</span>
            </div>

            <div className="draw-card__watermark" aria-hidden="true">
              <img src={lotteryBowlWatermark} alt="" />
            </div>

            <button className="draw-card__button" type="button" onClick={() => navigate(draw.route)}>
              <span>Play Now</span>
              <ArrowRightIcon />
            </button>
          </div>
        ))}
      </div>

      <section className="home-quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`home-quick-action ${action.id === "home" ? "is-active" : ""}`}
            onClick={() => navigate(action.path)}
          >
            <span className={`home-quick-action-icon ${action.id === "add-cash" ? "home-quick-action-icon--add" : ""}`}>
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
            <path
              d="M12 2.35 4.75 5.55v5.95c0 4.55 3.05 8.45 7.25 10.05 4.2-1.6 7.25-5.5 7.25-10.05V5.55L12 2.35Z"
              fill="currentColor"
            />
            <path
              d="m9.6 12.15 1.85 1.85 4.15-4.2"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="home-trust-copy">
          <strong>Play Safe. Play Legal.</strong>
          <span>100% Secure &amp; Trusted</span>
        </div>
        <span className="home-trust-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9.5 7.5 15 12l-5.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </section>
    </div>
  );
}

export default Home;
