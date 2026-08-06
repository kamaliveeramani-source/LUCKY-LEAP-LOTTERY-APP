import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import "./GamePages.css";

const DICE_OPTIONS = [1, 2, 3, 4, 5, 6];
const ODDS = "1 : 150";

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createRoundId() {
  return `D3-${Date.now().toString().slice(-5)}`;
}

function Dice3MinGame() {
  const { balance, withdraw, deposit } = useWallet();
  const [timeLeft, setTimeLeft] = useState(180);
  const [selectedDie, setSelectedDie] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [roundId, setRoundId] = useState(createRoundId());
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setRoundId(createRoundId());
      setTimeLeft(180);
      setSelectedDie(null);
    }
  }, [timeLeft]);

  const handlePlay = () => {
    if (!selectedDie) {
      alert("Select a dice face before playing.");
      return;
    }

    const stake = Number(betAmount);
    if (!betAmount || stake <= 0) {
      alert("Enter a valid bet amount.");
      return;
    }

    if (stake > balance) {
      alert("Insufficient wallet balance for this bet.");
      return;
    }

    const winningNumber = DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)];
    const win = winningNumber === selectedDie;
    const payout = win ? stake * 150 : 0;
    const balanceAfter = win ? balance - stake + payout : balance - stake;

    withdraw(stake);
    if (win) deposit(payout);
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
    setTimeLeft(180);
  };

  return (
    <div className="page-content game-page">
      <div className="game-hero">
        <div className="badge-pill">Dice 3 Minutes</div>
        <h2>Dice 3 Minutes</h2>
        <p>Pick one dice face, stake your amount, and chase a strong 1:150 payout in a fast round.</p>
      </div>

      <div className="game-top-grid">
        <section className="game-card">
          <div className="game-card-title">Round</div>
          <strong className="game-card-value">{roundId}</strong>
          <p className="game-card-note">Current active draw for this session.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Countdown</div>
          <strong className="game-card-value">{formatTimer(timeLeft)}</strong>
          <p className="game-card-note">New round starts automatically when the timer hits zero.</p>
        </section>

        <section className="game-card">
          <div className="game-card-title">Wallet Balance</div>
          <strong className="game-card-value">₹ {balance.toLocaleString()}</strong>
          <p className="game-card-note">Available funds for this demo bet.</p>
        </section>
      </div>

      <div className="game-panel">
        <div className="game-section-title">Select Dice Face</div>
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
          <label htmlFor="dice-bet">Bet Amount</label>
          <input
            id="dice-bet"
            type="number"
            value={betAmount}
            onChange={(event) => setBetAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="game-action-row">
          <div>
            <div className="game-card-title">Odds</div>
            <p className="game-card-value">{ODDS}</p>
          </div>
          <button type="button" className="btn btn-gradient-warning btn-pill" onClick={handlePlay}>
            Play Now
          </button>
        </div>
      </div>

      <div className="history-panel">
        <div className="history-title">
          <div>
            <div className="game-section-title">History</div>
            <p className="history-note">Recent dice outcomes and last winning rounds.</p>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="history-row">
            <strong>No plays yet</strong>
            <span>Play a round to keep history here.</span>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-row">
              <strong>{item.round}</strong>
              <span>Selected: {item.selection}</span>
              <span>Result: {item.winningNumber} • {item.result}</span>
              <span>Bet ₹{item.bet} • Payout ₹{item.payout}</span>
            </div>
          ))
        )}
      </div>

      {showResult && result && (
        <div className="game-result-modal" onClick={() => setShowResult(false)}>
          <div className="game-result-card" onClick={(event) => event.stopPropagation()}>
            <h3>{result.result === "Win" ? "You Won!" : "Better Luck Next Time"}</h3>
            <p>
              Winning dice face: <strong>{result.winningNumber}</strong>. Your selection was <strong>{result.selection}</strong>.
            </p>
            <p>{result.result === "Win" ? `Payout ₹${result.payout}` : "No payout this round."}</p>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => setShowResult(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dice3MinGame;
