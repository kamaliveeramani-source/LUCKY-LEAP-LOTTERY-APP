import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useNotification } from "../context/NotificationContext";
import "./GamePages.css";

const DICE_OPTIONS = [1, 2, 3, 4, 5, 6];
const ODDS = "1 : 150";

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createRoundId() {
  return `D5-${Date.now().toString().slice(-5)}`;
}

function Dice5MinGame() {
  const { balance, withdraw, deposit } = useWallet();
  const [timeLeft, setTimeLeft] = useState(300);
  const [selectedDie, setSelectedDie] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [roundId, setRoundId] = useState(createRoundId());
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setRoundId(createRoundId());
      setTimeLeft(300);
      setSelectedDie(null);
    }
  }, [timeLeft]);

  const { notify } = useNotification();

  const handlePlay = async () => {
    if (!selectedDie) {
      notify("warning", "Select a dice face before playing.");
      return;
    }

    const stake = Number(betAmount);
    if (!betAmount || stake <= 0) {
      notify("warning", "Enter a valid bet amount.");
      return;
    }

    if (stake > balance) {
      notify("error", "Insufficient wallet balance for this bet.");
      return;
    }

    const winningNumber = DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)];
    const win = winningNumber === selectedDie;
    const payout = win ? stake * 150 : 0;
    const balanceAfter = win ? balance - stake + payout : balance - stake;

    setSubmitting(true);
    setError("");
    try {
      await withdraw(stake);
      if (win) await deposit(payout);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Bet failed";
      setError(msg);
      notify("error", msg);
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
    }

    const entry = {
      id: Date.now(),
      round: roundId,
      selection: selectedDie,
      winningNumber,
      bet: stake,
      payout,
      balanceAfter,
      result: win ? "Win" : "Lose",
    };

    setHistory((prev) => [entry, ...prev].slice(0, 6));
    setResult(entry);
    setShowResult(true);
    setBetAmount("");
    setSelectedDie(null);
    setRoundId(createRoundId());
    setTimeLeft(300);
  };

  return (
    <div className="page-content game-page">
      <div className="game-hero">
        <div className="badge-pill">Dice 5 Minutes</div>
        <h2>Dice 5 Minutes</h2>
        <p>Place your dice bet and wait for the five-minute draw to complete. Same odds, steady pace.</p>
      </div>

      <div className="game-top-grid">
        <section className="game-card">
          <div className="game-card-title">Round</div>
          <strong className="game-card-value">{roundId}</strong>
          <p className="game-card-note">Current draw identifier for this session.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Countdown</div>
          <strong className="game-card-value">{formatTimer(timeLeft)}</strong>
          <p className="game-card-note">The round resets after the timer completes.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Wallet Balance</div>
          <strong className="game-card-value">₹ {balance.toLocaleString()}</strong>
          <p className="game-card-note">Available funds for this demo bet.</p>
        </section>
      </div>

      <div className="game-panel">
        <div className="game-section-title">Choose a Dice Face</div>
        <div className="dice-grid">
          {DICE_OPTIONS.map((face) => (
            <button
              key={face}
              type="button"
              className={`dice-face ${selectedDie === face ? "selected" : ""}`}
              onClick={() => setSelectedDie(face)}
            >
              {face}
            </button>
          ))}
        </div>

        <div className="game-input-row">
          <label htmlFor="dice5-bet">Bet Amount</label>
          <input
            id="dice5-bet"
            type="number"
            value={betAmount}
            onChange={(event) => setBetAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="game-action-row">
          <div>
            <div className="game-card-title">Odds</div>
            <p className="game-card-value">{ODDS}</p>
          </div>
          <button type="button" className="btn btn-gradient-warning btn-pill" onClick={handlePlay} disabled={submitting}>
            {submitting ? "Processing..." : "Play Now"}
          </button>
        </div>
      </div>

      <div className="history-panel">
        <div className="history-title">
          <div>
            <div className="game-section-title">Recent Rounds</div>
            <p className="history-note">Keep track of the last plays and dice outcomes.</p>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="history-row">
            <strong>No history yet</strong>
            <span>After you play, round results will appear here.</span>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-row">
              <strong>{item.round}</strong>
              <span>Selection: {item.selection}</span>
              <span>Result: {item.winningNumber} • {item.result}</span>
              <span>Bet ₹{item.bet} • Payout ₹{item.payout}</span>
            </div>
          ))
        )}
      </div>

      {showResult && result && (
        <div className="game-result-modal" onClick={() => setShowResult(false)}>
          <div className="game-result-card" onClick={(event) => event.stopPropagation()}>
            <h3>{result.result === "Win" ? "Big Win!" : "Round Complete"}</h3>
            <p>
              Winning face was <strong>{result.winningNumber}</strong>. You selected <strong>{result.selection}</strong>.
            </p>
            <p>{result.result === "Win" ? `You earned ₹${result.payout}` : "Try again in the next draw."}</p>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => setShowResult(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dice5MinGame;
