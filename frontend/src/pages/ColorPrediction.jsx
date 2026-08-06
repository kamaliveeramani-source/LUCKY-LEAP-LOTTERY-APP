import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useNotification } from "../context/NotificationContext";
import "./GamePages.css";

const COLORS = [
  { key: "green", label: "Green" },
  { key: "violet", label: "Violet" },
  { key: "red", label: "Red" },
];
const NUMBERS = Array.from({ length: 10 }, (_, index) => index);

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getColourForNumber(number) {
  if (number <= 3) return "green";
  if (number <= 6) return "violet";
  return "red";
}

function createRoundId() {
  return `CP-${Date.now().toString().slice(-5)}`;
}

function ColorPrediction() {
  const { balance, withdraw, deposit } = useWallet();
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedColour, setSelectedColour] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
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
      setTimeLeft(60);
      setSelectedColour(null);
      setSelectedNumber(null);
    }
  }, [timeLeft]);

  const { notify } = useNotification();

  const handlePlay = async () => {
    if (!selectedColour) {
      notify("warning", "Choose a colour to bet on.");
      return;
    }

    if (selectedNumber === null) {
      notify("warning", "Choose a number between 0 and 9.");
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

    const winningNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const winningColour = getColourForNumber(winningNumber);
    const colourWin = selectedColour === winningColour;
    const exactWin = selectedNumber === winningNumber;
    const payout = exactWin ? stake * 250 : colourWin ? stake * 50 : 0;
    const balanceAfter = exactWin || colourWin ? balance - stake + payout : balance - stake;

    setSubmitting(true);
    setError("");
    try {
      await withdraw(stake);
      if (payout > 0) await deposit(payout);
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
      colour: selectedColour,
      number: selectedNumber,
      winningNumber,
      winningColour,
      result: exactWin ? "Exact Match" : colourWin ? "Colour Win" : "Lose",
      payout,
      bet: stake,
      balanceAfter,
    };

    setHistory((prev) => [entry, ...prev].slice(0, 6));
    setResult(entry);
    setShowResult(true);
    setBetAmount("");
    setSelectedColour(null);
    setSelectedNumber(null);
    setRoundId(createRoundId());
    setTimeLeft(60);
  };

  return (
    <div className="page-content game-page">
      <div className="game-hero">
        <div className="badge-pill">Colour Prediction</div>
        <h2>Colour Prediction</h2>
        <p>Select a colour and a number, then stake your bet before the one-minute countdown ends.</p>
      </div>

      <div className="game-top-grid">
        <section className="game-card">
          <div className="game-card-title">Round</div>
          <strong className="game-card-value">{roundId}</strong>
          <p className="game-card-note">Live draw session for this game.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Countdown</div>
          <strong className="game-card-value">{formatTimer(timeLeft)}</strong>
          <p className="game-card-note">A new prediction round begins automatically.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Wallet Balance</div>
          <strong className="game-card-value">₹ {balance.toLocaleString()}</strong>
          <p className="game-card-note">Available funds for this demo bet.</p>
        </section>
      </div>

      <div className="game-panel">
        <div className="game-section-title">Pick a Colour</div>
        <div className="dice-grid">
          {COLORS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`color-chip ${option.key} ${selectedColour === option.key ? "selected" : ""}`}
              onClick={() => setSelectedColour(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="game-section-title">Pick a Number</div>
        <div className="color-grid">
          {NUMBERS.map((number) => (
            <button
              key={number}
              type="button"
              className={`number-pill ${selectedNumber === number ? "selected" : ""}`}
              onClick={() => setSelectedNumber(number)}
            >
              {number}
            </button>
          ))}
        </div>

        <div className="game-input-row">
          <label htmlFor="colour-bet">Bet Amount</label>
          <input
            id="colour-bet"
            type="number"
            value={betAmount}
            onChange={(event) => setBetAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="game-action-row">
          <div>
            <div className="game-card-title">Payout</div>
            <p className="game-card-note">Colour win pays 50x, exact number match pays 250x.</p>
          </div>
          <button type="button" className="btn btn-gradient-secondary btn-pill" onClick={handlePlay} disabled={submitting}>
            {submitting ? "Processing..." : "Play Now"}
          </button>
        </div>
      </div>

      <div className="history-panel">
        <div className="history-title">
          <div>
            <div className="game-section-title">Round History</div>
            <p className="history-note">Track predicted colours, numbers, and winning results.</p>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="history-row">
            <strong>No rounds yet</strong>
            <span>Play to populate the history list.</span>
          </div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="history-row">
              <strong>{entry.round}</strong>
              <span>Prediction: {entry.colour} / {entry.number}</span>
              <span>Result: {entry.winningColour} / {entry.winningNumber}</span>
              <span>{entry.result} • Payout ₹{entry.payout}</span>
            </div>
          ))
        )}
      </div>

      {showResult && result && (
        <div className="game-result-modal" onClick={() => setShowResult(false)}>
          <div className="game-result-card" onClick={(event) => event.stopPropagation()}>
            <div className={`winning-colour-banner ${result.winningColour}`}>Winning Colour: {result.winningColour.toUpperCase()}</div>
            <h3>{result.payout > 0 ? "Congratulations!" : "Round Complete"}</h3>
            <p>
              Winning number <strong>{result.winningNumber}</strong> landed on <strong>{result.winningColour}</strong>.
            </p>
            <p>{result.payout > 0 ? `Payout ₹${result.payout}` : "No payout this round."}</p>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => setShowResult(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPrediction;
