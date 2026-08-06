import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./GamePages.css";

const quickGames = [
  {
    id: "jackpot",
    banner: "💎",
    title: "Jackpot",
    path: "/jackpot",
    odds: "1:5,000",
    image: "💰",
    duration: "Live Draw",
  },
  {
    id: "kerala-lottery",
    banner: "🎟",
    title: "Kerala Lottery",
    path: "/lottery-game",
    odds: "Varies",
    image: "🎫",
    duration: "Daily Draws",
  },
  {
    id: "dice-3",
    banner: "🎲",
    title: "Dice 3 Minutes",
    path: "/dice-3",
    odds: "1:150",
    image: "🎲",
    duration: "3 Minutes",
  },
  {
    id: "dice-5",
    banner: "🎲",
    title: "Dice 5 Minutes",
    path: "/dice-5",
    odds: "1:150",
    image: "⏳",
    duration: "5 Minutes",
  },
  {
    id: "color-prediction",
    banner: "🎨",
    title: "Colour Prediction",
    path: "/color-prediction",
    odds: "50x / 250x",
    image: "🌈",
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
  { id: "dice-mania", title: "Dice Mania", badge: "🔥", subtitle: "1:150 Odds" },
  { id: "colour-bonus", title: "Colour Prediction", badge: "🎨", subtitle: "Extra Bonus" },
  { id: "kerala-jackpot", title: "Kerala Jackpot", badge: "🎟", subtitle: "Mega Prize" },
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
  const [nextDraw, setNextDraw] = useState(138);
  const [jackpotPool, setJackpotPool] = useState(() => {
    const stored = window.localStorage.getItem("jackpot_pool");
    return stored && !Number.isNaN(Number(stored)) ? Number(stored) : 32000000;
  });
  const [jackpotRound, setJackpotRound] = useState(() => window.localStorage.getItem("jackpot_current_round") || "ROUND-1524");
  const [bonusBalance] = useState(520);
  const [winningsToday] = useState(18400);
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    const nextDrawAt = Number(window.localStorage.getItem("jackpot_next_draw")) || Date.now() + 300000;
    window.localStorage.setItem("jackpot_next_draw", String(nextDrawAt));
    const timer = window.setInterval(() => {
      const diff = Math.ceil((nextDrawAt - Date.now()) / 1000);
      if (diff <= 0) {
        setRoundIncrement((current) => current + 1);
        setNextDraw(180);
        window.localStorage.setItem("jackpot_next_draw", String(Date.now() + 300000));
        setJackpotRound(window.localStorage.getItem("jackpot_current_round") || jackpotRound);
        return;
      }
      setNextDraw(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [jackpotRound]);

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
        <article className="quick-play-card jackpot-lobby-card" onClick={() => navigate("/jackpot")}> 
          <div className="quick-play-card-top">
            <div className="quick-play-image">💎</div>
            <span className="game-badge live">Jackpot</span>
          </div>
          <div className="quick-play-card-body">
            <h3>Live Jackpot</h3>
            <p>Prize pool grows as users place bets. New winner every 5 minutes.</p>
            <div className="quick-play-meta">
              <span>Pool: ₹{jackpotPool.toLocaleString()}</span>
              <span>Next: {formatSeconds(nextDraw)}</span>
            </div>
          </div>
          <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate("/jackpot")}>Play Now</button>
        </article>
        {quickGames.map((game) => (
          <article key={game.id} className="quick-play-card">
            <div className="quick-play-card-top">
              <div className="quick-play-image">{game.image}</div>
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
            <div className="promotion-icon">{promo.badge}</div>
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
        <button type="button" className="fab-button" onClick={() => setShowFabMenu((prev) => !prev)}>➕</button>
        {showFabMenu && (
          <div className="fab-menu">
            <button type="button" className="fab-action" onClick={() => navigate("/wallet?mode=add")}>Add Money</button>
            <button type="button" className="fab-action" onClick={() => navigate("/history")}>My Bets</button>
            <button type="button" className="fab-action" onClick={() => navigate("/history")}>History</button>
            <button type="button" className="fab-action" onClick={() => navigate("/support")}>Support</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGames;
