import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./GamePages.css";

function GameLobbyIcon({ type }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" };

  switch (type) {
    case "lottery":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h10v16l-5-3-5 3V4Z" {...stroke} />
        </svg>
      );
    case "dice":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="3" {...stroke} />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case "timer":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="7" {...stroke} />
          <path d="M12 10v4l2 2M9 3h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "color":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3c-4 0-7 3-7 7a4 4 0 0 0 4 4h1v-4l4-1 1-4H12Z" {...stroke} />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="11" cy="6" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
      );
    case "fire":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3s-4 5-4 9a4 4 0 0 0 8 0c0-4-4-9-4-9Z" {...stroke} />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l2.2 4.5L19 8.3l-3.5 3.4.8 4.9L12 14.8 7.7 16.6l.8-4.9L5 8.3l4.8-.8L12 3Z" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" {...stroke} />
        </svg>
      );
  }
}

const quickGames = [
  {
    id: "kerala-lottery",
    icon: "lottery",
    title: "Kerala Lottery",
    path: "/lottery-game",
    odds: "Varies",
    duration: "Daily Draws",
  },
  {
    id: "dice-3",
    icon: "dice",
    title: "Dice 3 Minutes",
    path: "/dice-3",
    odds: "1:150",
    duration: "3 Minutes",
  },
  {
    id: "dice-5",
    icon: "timer",
    title: "Dice 5 Minutes",
    path: "/dice-5",
    odds: "1:150",
    duration: "5 Minutes",
  },
  {
    id: "color-prediction",
    icon: "color",
    title: "Colour Prediction",
    path: "/color-prediction",
    odds: "50x / 250x",
    duration: "1 Minute",
  },
];

const demoWinners = [
  { name: "Kamal", amount: 1500 },
  { name: "Arun", amount: 6000 },
  { name: "Rahul", amount: 18000 },
  { name: "Meera", amount: 3200 },
  { name: "Anita", amount: 4800 },
];

const promotions = [
  { id: "dice-mania", title: "Dice Mania", icon: "fire", subtitle: "1:150 Odds" },
  { id: "colour-bonus", title: "Colour Prediction", icon: "color", subtitle: "Extra Bonus" },
  { id: "kerala-lottery", title: "Kerala Lottery", icon: "lottery", subtitle: "Mega Prize" },
];

const activityFeed = [
  { time: "11:02", game: "Dice 3 Minutes", bet: "₹250", result: "Win", amount: 37500 },
  { time: "10:49", game: "Colour Prediction", bet: "₹100", result: "Lose", amount: -100 },
  { time: "10:28", game: "Kerala Lottery", bet: "₹500", result: "Win", amount: 12000 },
  { time: "09:55", game: "Dice 5 Minutes", bet: "₹300", result: "Lose", amount: -300 },
  { time: "09:30", game: "Colour Prediction", bet: "₹150", result: "Win", amount: 3750 },
];

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatRound(prefix, increment) {
  const date = new Date();
  const dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `#${dateString}${String(increment).padStart(3, "0")}`;
}

function MyGames() {
  const navigate = useNavigate();
  const { balance } = useWallet();
  const [roundIncrement, setRoundIncrement] = useState(1);
  const [nextDraw, setNextDraw] = useState(180);
  const [bonusBalance] = useState(520);
  const [winningsToday] = useState(18400);
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNextDraw((current) => {
        if (current <= 1) {
          setRoundIncrement((inc) => inc + 1);
          return 180;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentRound = useMemo(() => formatRound("KL", roundIncrement), [roundIncrement]);

  const gamesPlayed = activityFeed.length + 18;
  const wins = activityFeed.filter((item) => item.amount > 0).length + 12;
  const losses = activityFeed.filter((item) => item.amount <= 0).length + 6;
  const winRate = Math.round((wins / (wins + losses)) * 100);
  const profitLoss = activityFeed.reduce((sum, item) => sum + item.amount, 2200);

  return (
    <div className="page-content game-page">
      <div className="my-games-hero lobby-hero">
        <div className="badge-pill">Game Lobby</div>
        <h2>Live betting lobby</h2>
        <p>Jump into fast rounds and premium game modes with a wallet-first experience.</p>
      </div>

      <div className="wallet-summary-card">
        <div className="wallet-summary-item">
          <div className="wallet-summary-label">Available Balance</div>
          <div className="wallet-summary-value">₹ {balance.toLocaleString()}</div>
        </div>
        <div className="wallet-summary-item">
          <div className="wallet-summary-label">Bonus Balance</div>
          <div className="wallet-summary-value">₹ {bonusBalance.toLocaleString()}</div>
        </div>
        <div className="wallet-summary-item">
          <div className="wallet-summary-label">Winnings Today</div>
          <div className="wallet-summary-value">₹ {winningsToday.toLocaleString()}</div>
        </div>
        <div className="wallet-summary-actions">
          <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate("/wallet?mode=add")}>Add Money</button>
          <button type="button" className="btn btn-secondary-custom btn-pill" onClick={() => navigate("/wallet?mode=withdraw")}>Withdraw</button>
        </div>
      </div>

      <div className="lobby-status-grid">
        <div className="lobby-status-card">
          <div className="lobby-status-label">Current Round</div>
          <div className="lobby-status-value">{currentRound}</div>
        </div>
        <div className="lobby-status-card">
          <div className="lobby-status-label">Next Draw</div>
          <div className="lobby-status-value">{formatSeconds(nextDraw)}</div>
        </div>
      </div>

      <section className="quick-play-grid">
        {quickGames.map((game) => (
          <article key={game.id} className="quick-play-card">
            <div className="quick-play-card-top">
              <div className="quick-play-image">
                <GameLobbyIcon type={game.icon} />
              </div>
              <span className="game-badge live">Live</span>
            </div>
            <div className="quick-play-card-body">
              <h3>{game.title}</h3>
              <p>{game.duration}</p>
              <div className="quick-play-meta">
                <span>Odds: {game.odds}</span>
                <span>Next: {formatSeconds(game.id === "dice-3" ? (nextDraw % 180) : game.id === "dice-5" ? (nextDraw + 120) % 300 : 60)}</span>
              </div>
            </div>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate(game.path)}>Play Now</button>
          </article>
        ))}
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <div className="section-label">Recent Winners</div>
            <div className="section-note">Hot streaks from the lobby.</div>
          </div>
        </div>
        <div className="winners-scroller">
          {demoWinners.map((winner) => (
            <div key={winner.name} className="winner-pill">
              <strong>{winner.name}</strong>
              <span>Won ₹{winner.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="promotion-grid">
        {promotions.map((promo) => (
          <article key={promo.id} className="promotion-card">
            <div className="promotion-icon">
              <GameLobbyIcon type={promo.icon} />
            </div>
            <h4>{promo.title}</h4>
            <p>{promo.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Games Played</div>
          <div className="stat-value">{gamesPlayed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wins</div>
          <div className="stat-value">{wins}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Losses</div>
          <div className="stat-value">{losses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{winRate}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit / Loss</div>
          <div className={`stat-value ${profitLoss >= 0 ? "positive" : "negative"}`}>₹ {profitLoss.toLocaleString()}</div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <div className="section-label">Recent Activity</div>
            <div className="section-note">Your latest demo bets and results.</div>
          </div>
        </div>

        <div className="activity-table">
          <div className="activity-row activity-header">
            <span>Time</span>
            <span>Game</span>
            <span>Bet</span>
            <span>Result</span>
            <span>Amount</span>
          </div>
          {activityFeed.map((item) => (
            <div key={`${item.time}-${item.game}`} className="activity-row">
              <span>{item.time}</span>
              <span>{item.game}</span>
              <span>{item.bet}</span>
              <span className={item.amount > 0 ? "positive" : "negative"}>{item.result}</span>
              <span className={item.amount > 0 ? "positive" : "negative"}>₹ {item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="fab-container">
        <button type="button" className="fab-button" onClick={() => setShowFabMenu((prev) => !prev)} aria-label="Quick actions">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
            <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        {showFabMenu && (
          <div className="fab-menu">
            <button type="button" className="fab-action" onClick={() => navigate("/wallet?mode=add")}>Add Money</button>
            <button type="button" className="fab-action" onClick={() => navigate("/my-games")}>My Bets</button>
            <button type="button" className="fab-action" onClick={() => navigate("/my-tickets")}>My Tickets</button>
            <button type="button" className="fab-action" onClick={() => navigate("/support")}>Support</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGames;
