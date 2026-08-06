import { useState, useEffect } from "react";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import "./LotteryGame.css";

const TABS = ["Single", "Double", "Triple", "Four"];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createRoundId() {
  return `KL-${Date.now().toString().slice(-5)}`;
}

function createRandomDigits(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

function sameDigitSet(a, b) {
  return a.split("").sort().join("") === b.split("").sort().join("");
}

function LotteryGame() {
  const { balance, withdraw, deposit } = useWallet();
  const [timeLeft, setTimeLeft] = useState(3600);
  const [activeTab, setActiveTab] = useState("Single");
  const [orders, setOrders] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);

  const [singleA, setSingleA] = useState("");
  const [singleB, setSingleB] = useState("");
  const [singleC, setSingleC] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [amountC, setAmountC] = useState("");

  const [doubleAB, setDoubleAB] = useState("");
  const [doubleAC, setDoubleAC] = useState("");
  const [doubleBC, setDoubleBC] = useState("");
  const [amountAB, setAmountAB] = useState("");
  const [amountAC, setAmountAC] = useState("");
  const [amountBC, setAmountBC] = useState("");

  const [tripleABC, setTripleABC] = useState("");
  const [tripleAmount, setTripleAmount] = useState("");
  const [tripleType, setTripleType] = useState("Straight");

  const [fourABCD, setFourABCD] = useState("");
  const [fourAmount, setFourAmount] = useState("");
  const [fourType, setFourType] = useState("Straight");

  const [roundId, setRoundId] = useState(createRoundId());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setRoundId(createRoundId());
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addBet = (obj) => {
    setOrders((prev) => [...prev, obj]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { notify } = useNotification();

  const addSingle = (type, number, amount) => {
    if (number.trim() === "") {
      notify("warning", "Enter Number");
      return;
    }

    if (amount === "") {
      notify("warning", "Enter Amount");
      return;
    }
    addBet({ id: Date.now(), game: "Single", type, number, amount: Number(amount) });
    notify("success", "Single bet added to the slip.");
  };

  const addDouble = (type, number, amount) => {
    if (number.trim() === "") {
      notify("warning", "Enter Double Digit");
      return;
    }

    if (number.length !== 2) {
      notify("warning", "Enter exactly 2 digits.");
      return;
    }

    if (amount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Double", type, number, amount: Number(amount) });
    notify("success", "Double bet added to the slip.");
  };

  const addTriple = () => {
    if (tripleABC.trim() === "") {
      notify("warning", "Enter Triple Digit");
      return;
    }

    if (tripleABC.length !== 3) {
      notify("warning", "Triple Digit must contain exactly 3 numbers");
      return;
    }

    if (tripleAmount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Triple", type: tripleType, number: tripleABC, amount: Number(tripleAmount) });
    setTripleABC("");
    setTripleAmount("");
    notify("success", "Triple bet added to the slip.");
  };

  const addFour = () => {
    if (fourABCD.trim() === "") {
      notify("warning", "Enter Four Digit");
      return;
    }

    if (fourABCD.length !== 4) {
      notify("warning", "Four Digit must contain exactly 4 numbers");
      return;
    }

    if (fourAmount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Four", type: fourType, number: fourABCD, amount: Number(fourAmount) });
    setFourABCD("");
    setFourAmount("");
    notify("success", "Four bet added to the slip.");
  };

  const removeOrder = (id) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = orders.reduce((sum, item) => sum + Number(item.amount), 0);

  const resolveBet = (bet, draw) => {
    if (bet.game === "Single") {
      const win = bet.number === draw.single[bet.type];
      return win ? bet.amount * 90 : 0;
    }

    if (bet.game === "Double") {
      const win = bet.number === draw.double[bet.type];
      return win ? bet.amount * 180 : 0;
    }

    if (bet.game === "Triple") {
      const exactWin = bet.number === draw.triple;
      const boxWin = bet.type === "Box" && sameDigitSet(bet.number, draw.triple);
      return exactWin ? bet.amount * 380 : boxWin ? bet.amount * 140 : 0;
    }

    if (bet.game === "Four") {
      const exactWin = bet.number === draw.four;
      const boxWin = bet.type === "Box" && sameDigitSet(bet.number, draw.four);
      return exactWin ? bet.amount * 900 : boxWin ? bet.amount * 320 : 0;
    }

    return 0;
  };

  const buyTicket = async () => {
    if (orders.length === 0) {
      notify("warning", "Add at least one bet to place your ticket.");
      return;
    }

    if (totalAmount > balance) {
      notify("error", "Insufficient wallet balance for this ticket.");
      return;
    }

    const draw = {
      single: {
        A: String(Math.floor(Math.random() * 10)),
        B: String(Math.floor(Math.random() * 10)),
        C: String(Math.floor(Math.random() * 10)),
      },
      double: {
        AB: createRandomDigits(2),
        AC: createRandomDigits(2),
        BC: createRandomDigits(2),
      },
      triple: createRandomDigits(3),
      four: createRandomDigits(4),
    };

    const payout = orders.reduce((sum, order) => sum + resolveBet(order, draw), 0);
    const outcome = payout > 0 ? "Win" : "Lose";
    const resultSummary = orders
      .map((order) => {
        const betPayout = resolveBet(order, draw);
        return `${order.game} ${order.number}: ${betPayout > 0 ? `Won ₹${betPayout}` : "No win"}`;
      })
      .join(" | ");

    try {
      await withdraw(totalAmount);
      if (payout > 0) await deposit(payout);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Ticket purchase failed";
      notify("error", msg);
      return;
    }

    setGameHistory((prev) => [
      {
        id: Date.now(),
        round: roundId,
        placedAt: new Date().toLocaleTimeString(),
        totalStake: totalAmount,
        totalPayout: payout,
        outcome,
        resultSummary,
        draw,
      },
      ...prev,
    ].slice(0, 8));

    setOrders([]);
    setRoundId(createRoundId());
    setTimeLeft(3600);
    notify("success", `Ticket placed. ${outcome === "Win" ? `You won ₹${payout}!` : "No winning bets this round."}`);
  };

  const sectionTitleStyle = {
    color: "var(--accent)",
    fontWeight: 700,
    letterSpacing: "0.04em",
    marginBottom: "8px",
  };

  return (
      <div className="page-content lottery-page">
        <div className="lottery-hero">
          <div className="lottery-hero-badge">Festive Draw</div>
          <h2>Kerala Lottery</h2>
          <p>Place demo lottery bets on a live-style draw with instant frontend results.</p>
        </div>

        <div className="lottery-section">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <h4 className="mb-2">Live draw session</h4>
              <p className="lottery-description">Choose your bet type, add selections to the slip, and confirm to resolve the draw.</p>
            </div>
            <div className="text-end">
              <div className="text-muted" style={{ fontSize: "0.8rem", marginBottom: "6px" }}>TIME REMAINING</div>
              <div className="lottery-total-pill lottery-timer">{formatTime(timeLeft)}</div>
              <div className="lottery-total-pill" style={{ marginTop: "10px" }}>Wallet: ₹ {balance.toLocaleString()}</div>
            </div>
          </div>

          <div className="lottery-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`lottery-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Single" && (
          <div className="lottery-section">
            <h4 style={sectionTitleStyle}>Single Digit</h4>
            <p className="lottery-description">Select one lucky digit from A, B, or C.</p>

            <div className="lottery-grid">
              {[
                { label: "A", value: singleA, onChange: setSingleA, amount: amountA, setAmount: setAmountA },
                { label: "B", value: singleB, onChange: setSingleB, amount: amountB, setAmount: setAmountB },
                { label: "C", value: singleC, onChange: setSingleC, amount: amountC, setAmount: setAmountC },
              ].map((item) => (
                <div key={item.label} className="lottery-grid-row bet-row">
                  <div className="lottery-grid-label bet-label">{item.label}</div>
                  <input
                    className="form-control lottery-input bet-input"
                    maxLength={1}
                    value={item.value}
                    onChange={(e) => item.onChange(e.target.value)}
                    placeholder="Digit"
                  />
                  <input
                    className="form-control lottery-input bet-amount"
                    placeholder="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) => item.setAmount(e.target.value)}
                  />
                  <button className="btn btn-gradient-success lottery-button bet-button" onClick={() => addSingle(item.label, item.value, item.amount)}>
                    Add Bet
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Double" && (
          <div className="lottery-section">
            <h4 style={{ ...sectionTitleStyle, color: "var(--accent-alt)" }}>Double Digit</h4>
            <p className="lottery-description">Try a two-digit combination like AB, AC, or BC.</p>

            <div className="lottery-grid">
              {[
                { label: "AB", value: doubleAB, onChange: setDoubleAB, amount: amountAB, setAmount: setAmountAB },
                { label: "AC", value: doubleAC, onChange: setDoubleAC, amount: amountAC, setAmount: setAmountAC },
                { label: "BC", value: doubleBC, onChange: setDoubleBC, amount: amountBC, setAmount: setAmountBC },
              ].map((item) => (
                <div key={item.label} className="lottery-grid-row bet-row">
                  <div className="lottery-grid-label bet-label">{item.label}</div>
                  <input
                    className="form-control lottery-input bet-input"
                    maxLength={2}
                    value={item.value}
                    onChange={(e) => item.onChange(e.target.value)}
                    placeholder="2 digits"
                  />
                  <input
                    className="form-control lottery-input bet-amount"
                    placeholder="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) => item.setAmount(e.target.value)}
                  />
                  <button className="btn btn-gradient-secondary lottery-button bet-button" onClick={() => addDouble(item.label, item.value, item.amount)}>
                    Add Bet
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Triple" && (
          <div className="lottery-section">
            <h4 style={{ ...sectionTitleStyle, color: "var(--accent-strong)" }}>Triple Digit</h4>
            <p className="lottery-description">Choose a three-digit combination and pick Straight or Box.</p>

            <div className="lottery-grid-row bet-row">
              <input
                type="text"
                maxLength={3}
                className="form-control lottery-input bet-input"
                placeholder="Enter 3-digit number"
                value={tripleABC}
                onChange={(e) => setTripleABC(e.target.value)}
              />
              <input
                type="number"
                className="form-control lottery-input bet-amount"
                placeholder="Amount"
                value={tripleAmount}
                onChange={(e) => setTripleAmount(e.target.value)}
              />
              <select className="form-select lottery-input bet-input" value={tripleType} onChange={(e) => setTripleType(e.target.value)}>
                <option>Straight</option>
                <option>Box</option>
              </select>
              <button className="btn btn-gradient-warning lottery-button bet-button" onClick={addTriple}>
                Add Bet
              </button>
            </div>
          </div>
        )}

        {activeTab === "Four" && (
          <div className="lottery-section">
            <h4 style={{ ...sectionTitleStyle, color: "var(--accent)" }}>Four Digit</h4>
            <p className="lottery-description">Go big with a four-number lucky pick.</p>

            <div className="lottery-grid-row bet-row">
              <input
                type="text"
                maxLength={4}
                className="form-control lottery-input bet-input"
                placeholder="Enter 4-digit number"
                value={fourABCD}
                onChange={(e) => setFourABCD(e.target.value)}
              />
              <input
                type="number"
                className="form-control lottery-input bet-amount"
                placeholder="Amount"
                value={fourAmount}
                onChange={(e) => setFourAmount(e.target.value)}
              />
              <select className="form-select lottery-input bet-input" value={fourType} onChange={(e) => setFourType(e.target.value)}>
                <option>Straight</option>
                <option>Box</option>
              </select>
              <button className="btn btn-gradient-danger lottery-button bet-button" onClick={addFour}>
                Add Bet
              </button>
            </div>
          </div>
        )}

        <div className="lottery-section">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <h3 style={{ color: "var(--accent)", margin: 0 }}>Bet Slip</h3>
              <p className="lottery-description">Your active bets are held here until you confirm the ticket.</p>
            </div>
            <div className="lottery-total-pill">Slip Total: ₹ {totalAmount}</div>
          </div>

          {orders.length === 0 ? (
            <p className="text-muted mb-0">No bets added yet. Use the tabs above to add a selection.</p>
          ) : (
            <div className="table-responsive">
              <table className="lottery-order-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Type</th>
                    <th>Number</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((item) => (
                    <tr key={item.id}>
                      <td>{item.game}</td>
                      <td>{item.type}</td>
                      <td>{item.number}</td>
                      <td>₹ {item.amount}</td>
                      <td>
                        <button className="btn btn-sm btn-gradient-danger lottery-button-small" onClick={() => removeOrder(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
            <button className="btn btn-gradient-success lottery-button lottery-footer-button" onClick={buyTicket}>
              Confirm Ticket
            </button>
            <div className="text-muted">Round {roundId} • {orders.length} bet{orders.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        <div className="lottery-section">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h3 style={{ color: "var(--accent)", margin: 0 }}>Draw History</h3>
            <p className="text-muted mb-0">See your most recent demo ticket outcomes.</p>
          </div>

          {gameHistory.length === 0 ? (
            <p className="text-muted">No draw history yet. Place a ticket to see results.</p>
          ) : (
            <div className="history-panel">
              {gameHistory.map((entry) => (
                <div key={entry.id} className="history-row">
                  <strong>{entry.round} • {entry.outcome}</strong>
                  <span>Stake ₹{entry.totalStake} • Payout ₹{entry.totalPayout}</span>
                  <span>{entry.placedAt}</span>
                  <span>{entry.resultSummary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

export default LotteryGame;
