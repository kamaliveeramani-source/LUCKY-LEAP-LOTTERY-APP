import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import {
  addRandomParticipants,
  addUserParticipant,
  createDemoParticipants,
  formatCurrency,
  formatDrawTime,
  getDefaultPool,
  getDrawSeconds,
  getInitialPool,
  getCurrentRound,
  getLastWinner,
  getNextDrawAt,
  getTimeRemaining,
  loadHistory,
  loadParticipants,
  randomRound,
  saveCurrentRound,
  saveHistory,
  saveNextDrawAt,
  saveParticipants,
  savePool,
} from "../utils/jackpotUtils";
import "./GamePages.css";

const MIN_BET = 10;
const MAX_BET = 10000;
const RESET_POOL_AFTER_DRAW = true;
const FALLBACK_POOL = getDefaultPool();
const DRAW_SOUND_ENABLED = true;

function JackpotGame() {
  const navigate = useNavigate();
  const { balance, withdraw, deposit } = useWallet();
  const [roundId, setRoundId] = useState(() => getCurrentRound());
  const [nextDrawAt, setNextDrawAt] = useState(() => getNextDrawAt());
  const [pool, setPool] = useState(() => getInitialPool());
  const [participants, setParticipants] = useState(() => {
    const stored = loadParticipants();
    return stored.length ? stored : createDemoParticipants(6);
  });
  const [history, setHistory] = useState(() => loadHistory());
  const [betAmount, setBetAmount] = useState(100);
  const [toast, setToast] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(nextDrawAt));
  const timerRef = useRef(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    savePool(pool);
  }, [pool]);

  useEffect(() => {
    saveCurrentRound(roundId);
  }, [roundId]);

  useEffect(() => {
    saveNextDrawAt(nextDrawAt);
  }, [nextDrawAt]);

  useEffect(() => {
    saveParticipants(participants);
  }, [participants]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      const remaining = getTimeRemaining(nextDrawAt);
      setTimeRemaining(remaining);
      if (remaining === 0) {
        runDraw();
      }
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [nextDrawAt, participants, pool, roundId, history]);

  useEffect(() => {
    const syncState = () => {
      setPool(getInitialPool());
      setRoundId(getCurrentRound());
    };

    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const countdownLabel = useMemo(() => formatDrawTime(timeRemaining), [timeRemaining]);
  const lastWinnerLabel = useMemo(() => getLastWinner() || "No winner yet", [history.length]);
  const participantCount = participants.length;
  const currentHistory = history.slice(0, 8);

  const createDrawSound = () => {
    if (!DRAW_SOUND_ENABLED || typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.26);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
      oscillator.stop(context.currentTime + 0.52);
    } catch (error) {
      // ignore audio errors in unsupported contexts.
    }
  };

  const placeBet = async () => {
    if (isDrawing) {
      setToast({ type: "error", message: "Wait for the draw to complete." });
      return;
    }

    const amount = Number(betAmount);
    if (!amount || amount < MIN_BET || amount > MAX_BET) {
      setToast({ type: "error", message: `Bet amount must be ₹${MIN_BET}–₹${MAX_BET}.` });
      return;
    }

    if (balance < amount) {
      setToast({ type: "error", message: "Insufficient Wallet Balance" });
      return;
    }

    setPlacing(true);
    try {
      await withdraw(amount);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.response?.data?.message || err.message || "Bet failed" });
      setPlacing(false);
      return;
    }

    const nextPool = pool + amount;
    const nextParticipants = addRandomParticipants(addUserParticipant(participants), Math.floor(Math.random() * 2) + 1);

    setPool(nextPool);
    setParticipants(nextParticipants);
    setToast({ type: "success", message: `Placed ₹${amount.toLocaleString()} on the jackpot.` });
    setPlacing(false);
  };

  const runDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    const activeParticipants = participants.length ? participants : createDemoParticipants(6);
    const winnerIndex = Math.floor(Math.random() * activeParticipants.length);
    const winner = activeParticipants[winnerIndex];
    const winnerName = winner.name;
    const prize = pool;
    const currentTime = new Date();
    const entry = {
      round: roundId,
      winnerName,
      prize,
      participants: activeParticipants.length,
      participantNames: activeParticipants.slice(0, 5).map((item) => item.name).join(", ") + (activeParticipants.length > 5 ? ", ..." : ""),
      date: currentTime.toLocaleDateString("en-IN"),
      time: currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      userWon: winner.isUser,
    };

    const nextHistory = [entry, ...history].slice(0, 50);
    const nextRoundId = randomRound();
    const nextDrawMs = Date.now() + getDrawSeconds() * 1000;
    const nextPool = RESET_POOL_AFTER_DRAW ? FALLBACK_POOL : pool;

      if (winner.isUser) {
      try {
        await deposit(prize);
      } catch (err) {
        console.error("deposit after jackpot win", err);
        // still continue — deposit failure will be surfaced via WalletContext error handling
      }
    }

    setHistory(nextHistory);
    setRoundId(nextRoundId);
    setNextDrawAt(nextDrawMs);
    setPool(nextPool);
    setParticipants(createDemoParticipants(6));
    setDrawResult({
      winnerName,
      prize,
      round: roundId,
      time: entry.time,
      userWon: winner.isUser,
    });
    setIsDrawing(false);
    createDrawSound();
    setToast({ type: "success", message: `${winnerName} won ₹${formatCurrency(prize)}.` });
  };

  const hideResult = () => {
    setDrawResult(null);
  };

  return (
    <div className="page-content game-page">
      <div className="game-hero jackpot-hero">
        <div className="badge-pill">Jackpot</div>
        <h2>Live Jackpot Arena</h2>
        <p>Enter your bet, join the draw, and watch the prize pool grow in real time.</p>
      </div>

      <div className="jackpot-panel">
        <div className="jackpot-header">
          <div>
            <div className="jackpot-label">Current Round</div>
            <div className="jackpot-value">{roundId}</div>
          </div>
          <div>
            <div className="jackpot-label">Time Remaining</div>
            <div className="jackpot-countdown animated-countdown">{countdownLabel}</div>
          </div>
        </div>

        <div className="jackpot-stats-grid">
          <div className="jackpot-stat-card">
            <span className="jackpot-stat-label">Prize Pool</span>
            <strong className="jackpot-pool-value">{formatCurrency(pool)}</strong>
          </div>
          <div className="jackpot-stat-card">
            <span className="jackpot-stat-label">Participants</span>
            <strong>{participantCount}</strong>
          </div>
          <div className="jackpot-stat-card">
            <span className="jackpot-stat-label">Last Winner</span>
            <strong>{lastWinnerLabel}</strong>
          </div>
        </div>

        <div className="jackpot-bet-grid">
          <div className="bet-input-row">
            <label htmlFor="jackpotBet">Enter bet amount</label>
            <input
              id="jackpotBet"
              type="number"
              min={MIN_BET}
              max={MAX_BET}
              value={betAmount}
              onChange={(event) => setBetAmount(Number(event.target.value))}
              className="bet-input-field"
            />
            <span className="bet-hint">Min ₹{MIN_BET} · Max ₹{MAX_BET}</span>
          </div>
          <div className="jackpot-action-row">
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={placeBet} disabled={placing}>
              {placing ? "Placing..." : "Place Bet"}
            </button>
            <button type="button" className="btn btn-secondary-custom btn-pill" onClick={() => navigate("/wallet")}>Open Wallet</button>
          </div>
        </div>

        <div className="participant-strip">
          {participants.slice(0, 8).map((player) => (
            <span key={player.id} className={`participant-pill ${player.isUser ? "participant-user" : "participant-demo"}`}>
              {player.name}
            </span>
          ))}
          {participantCount > 8 && <span className="participant-pill ellipsis">+{participantCount - 8} more</span>}
        </div>

        <section className="section-block jackpot-history-section">
          <div className="section-header">
            <div>
              <div className="section-label">Draw History</div>
              <div className="section-note">Completed rounds are stored in your browser.</div>
            </div>
          </div>

          <div className="jackpot-history-table">
            <div className="history-row activity-header">
              <span>Round</span>
              <span>Winner</span>
              <span>Prize</span>
              <span>Participants</span>
              <span>Date</span>
              <span>Time</span>
            </div>
            {currentHistory.length ? (
              currentHistory.map((item) => (
                <div key={`${item.round}-${item.time}`} className="history-row">
                  <span>{item.round}</span>
                  <span>{item.winnerName}</span>
                  <span>{formatCurrency(item.prize)}</span>
                  <span>{item.participants}</span>
                  <span>{item.date}</span>
                  <span>{item.time}</span>
                </div>
              ))
            ) : (
              <div className="history-row no-history-row">
                <span>No completed rounds yet. Place a bet to begin.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {toast && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {drawResult && (
        <div className={`result-popup ${drawResult.userWon ? "win" : "lose"}`}>
          <div className="result-card">
            <div className="confetti-wrapper">
              {drawResult.userWon && Array.from({ length: 24 }).map((_, index) => (
                <span key={index} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 20}%`, animationDelay: `${index * 0.06}s` }} />
              ))}
            </div>
            <h3>🏆 JACKPOT WINNER</h3>
            <p className="result-summary">{drawResult.winnerName} won the round.</p>
            <div className="result-detail-grid">
              <div>
                <span>Winner</span>
                <strong>{drawResult.winnerName}</strong>
              </div>
              <div>
                <span>Winning Amount</span>
                <strong>{formatCurrency(drawResult.prize)}</strong>
              </div>
              <div>
                <span>Round</span>
                <strong>{drawResult.round}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{drawResult.time}</strong>
              </div>
            </div>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={hideResult}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JackpotGame;
