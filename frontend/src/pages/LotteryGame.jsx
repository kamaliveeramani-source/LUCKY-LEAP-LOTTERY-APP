import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import API, { getAuthToken } from "../services/api";
import "./LotteryGame.css";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createRoundId() {
  return `KL-${Date.now().toString().slice(-5)}`;
}

const QUICK_GUESS_SLOTS = ["02:30 PM", "03:00 PM", "03:30 PM"];

function QuickGuessControl({ section, selectedSlot, isOpen, onToggle, onSelect }) {
  return (
    <div className="quick-guess-control">
      <button
        type="button"
        className={`quick-guess ${isOpen ? "active" : ""}`}
        aria-expanded={isOpen}
        aria-controls={`${section}-quick-guess-slots`}
        onClick={onToggle}
      >
        Quick Guess
      </button>
      {isOpen ? (
        <div className="quick-guess-slots" id={`${section}-quick-guess-slots`} role="group" aria-label={`${section} quick guess time slots`}>
          {QUICK_GUESS_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`quick-guess-slot ${selectedSlot === slot ? "selected" : ""}`}
              aria-pressed={selectedSlot === slot}
              onClick={() => onSelect(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LotteryGame() {
  const { balance, refreshWallet } = useWallet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedLotteryId = searchParams.get("lotteryId");
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600);
  const [orders, setOrders] = useState([]);
  const token = getAuthToken();

  useEffect(() => {
    let isMounted = true;

    const loadLottery = async () => {
      if (!selectedLotteryId) {
        setSelectedLottery(null);
        setLoadError("No lottery selected. Please choose a draw from the lottery list.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const res = await API.get(`/lottery/${selectedLotteryId}`);
        const lottery = res.data?.data || null;

        if (!isMounted) return;

        if (!lottery) {
          setSelectedLottery(null);
          setLoadError(`Lottery ${selectedLotteryId} could not be found.`);
          return;
        }

        setSelectedLottery(lottery);
      } catch (err) {
        console.error("Failed to load selected lottery", err);

        if (!isMounted) return;

        setSelectedLottery(null);
        setLoadError(
          err.response?.status === 404
            ? `Lottery ${selectedLotteryId} does not exist or is no longer available.`
            : "Unable to load lottery details. Please try again."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLottery();

    return () => {
      isMounted = false;
    };
  }, [selectedLotteryId]);

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
  const [tripleType, setTripleType] = useState("Box");
  const [quickGuessSlots, setQuickGuessSlots] = useState({
    single: "03:00 PM",
    double: "03:00 PM",
    triple: "03:00 PM",
  });
  const [openQuickGuess, setOpenQuickGuess] = useState(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

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

  useEffect(() => {
    if (!isHowToPlayOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsHowToPlayOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isHowToPlayOpen]);

  const { notify } = useNotification();

  const addBet = (obj) => {
    setOrders((prev) => [...prev, obj]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addSingle = (type, number, amount) => {
    if (!number || !String(number).trim()) {
      notify("warning", "Enter Number");
      return;
    }

    if (!amount || amount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Single", type, number, amount: Number(amount) });
    notify("success", "Single bet added to the slip.");
  };

  const addDouble = (type, number, amount) => {
    if (!number || !String(number).trim()) {
      notify("warning", "Enter Double Digit");
      return;
    }

    if (String(number).length !== 2) {
      notify("warning", "Enter exactly 2 digits.");
      return;
    }

    if (!amount || amount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Double", type, number, amount: Number(amount) });
    notify("success", "Double bet added to the slip.");
  };

  const addTriple = () => {
    if (!tripleABC || !String(tripleABC).trim()) {
      notify("warning", "Enter Triple Digit");
      return;
    }

    if (String(tripleABC).length !== 3) {
      notify("warning", "Triple Digit must contain exactly 3 numbers");
      return;
    }

    if (!tripleAmount || tripleAmount === "") {
      notify("warning", "Enter Amount");
      return;
    }

    addBet({ id: Date.now(), game: "Triple", type: tripleType, number: String(tripleABC), amount: Number(tripleAmount) });
    setTripleABC("");
    setTripleAmount("");
    notify("success", "Triple bet added to the slip.");
  };

  const updateTripleDigit = (index, value) => {
    const digits = String(tripleABC).padEnd(3, " ").split("");
    digits[index] = value.slice(-1);
    setTripleABC(digits.join("").trimEnd());
  };

  const removeOrder = (id) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = orders.reduce((sum, item) => sum + Number(item.amount), 0);
  const displayLotteryName = selectedLottery?.lotteryName || "Lottery";

  const selectQuickGuessSlot = (section, slot) => {
    setQuickGuessSlots((previous) => ({ ...previous, [section]: slot }));
    setOpenQuickGuess(null);
  };

  const buyTicket = async () => {
    if (orders.length === 0) {
      notify("warning", "Add at least one bet to place your ticket.");
      return;
    }

    if (!selectedLottery?.id) {
      notify("error", "No lottery selected. Please return to the lottery list and choose a draw.");
      return;
    }

    if (totalAmount > balance) {
      notify("error", "Insufficient wallet balance for this ticket.");
      return;
    }

    try {
      for (const order of orders) {
        const betType = order.game.toUpperCase();
        await API.post(
          "/ticket/buy",
          {
            lotteryId: Number(selectedLottery.id),
            betType,
            selectedNumber: String(order.number),
            amount: Number(order.amount),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      await refreshWallet();
      setOrders([]);
      setRoundId(createRoundId());
      setTimeLeft(3600);
      notify("success", `Ticket(s) purchased for ${selectedLottery.lotteryName}.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Ticket purchase failed";
      notify("error", msg);
    }
  };

  return (
    <div className="page-content lottery-page">
      <div className="lottery-mobile-shell">
        <div className="lottery-mobile-header">
          <button type="button" className="lottery-mobile-back" aria-label="Back" onClick={() => navigate(-1)}>
            ←
          </button>
          <div className="lottery-mobile-title">{displayLotteryName}</div>
          <div className="lottery-mobile-balance">
            <span className="lottery-balance-label">3Digit Balance</span>
            <span className="lottery-balance-value">₹ {Number(balance || 0).toLocaleString("en-IN")}</span>
            <svg className="lottery-wallet-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v2H6.5A2.5 2.5 0 0 0 4 9.5v8A2.5 2.5 0 0 0 6.5 20H19a1 1 0 0 0 1-1v-2H6.5A2.5 2.5 0 0 1 4 14.5z" fill="currentColor" />
              <path d="M6.5 8H20v9H6.5a2.5 2.5 0 0 1 0-5H20" fill="#a875e8" />
              <circle cx="17" cy="14" r="1" fill="white" />
            </svg>
          </div>
        </div>

        {!selectedLotteryId ? (
          <div className="lottery-empty-state">
            <h2>No lottery selected</h2>
            <p>{loadError || "Please choose a lottery to continue."}</p>
            <button type="button" className="lottery-back-btn" onClick={() => navigate("/lottery")}>Browse lotteries</button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="lottery-loading-state" role="status" aria-live="polite">
            Loading lottery details...
          </div>
        ) : null}

        {!isLoading && !selectedLottery && selectedLotteryId ? (
          <div className="lottery-empty-state">
            <h2>Lottery unavailable</h2>
            <p>{loadError || "The selected lottery could not be loaded."}</p>
            <button type="button" className="lottery-back-btn" onClick={() => navigate("/lottery")}>Browse lotteries</button>
          </div>
        ) : null}

        {selectedLottery ? (
          <div className="lottery-bet-panel">
            <div className="lottery-bet-header">
              <button type="button" className="lottery-pill ghost" onClick={() => setIsHowToPlayOpen(true)}>How to play</button>
              <div className="lottery-bet-header__meta">Ticket</div>
            </div>

          <div className="lottery-countdown-box">
            <div className="lottery-type-indicators" aria-label="Lottery type indicators">
              <div className="bet-letter red">*</div>
              <div className="bet-letter orange">*</div>
              <div className="bet-letter blue">*</div>
            </div>
            <div className="lottery-countdown-separator" aria-hidden="true" />
            <div>
              <div className="label">Time remaining</div>
              <div className="timer" aria-label={`Time remaining ${formatTime(timeLeft)}`}>
                {formatTime(timeLeft).split("").map((character, index) => (
                  character === ":"
                    ? <span className="timer-separator" key={`separator-${index}`}>:</span>
                    : <span className="timer-digit" key={`digit-${index}`}>{character}</span>
                ))}
              </div>
              <div className="suffix">03:00 PM</div>
            </div>
          </div>

          <div className="bet-section">
            <div className="bet-section-head">
              <div className="bet-section-title">
                <strong>Single Digit</strong>
                <span>₹10.50</span>
                <span className="win-pill">Win ₹100.00</span>
              </div>
              <QuickGuessControl
                section="single"
                selectedSlot={quickGuessSlots.single}
                isOpen={openQuickGuess === "single"}
                onToggle={() => setOpenQuickGuess((current) => current === "single" ? null : "single")}
                onSelect={(slot) => selectQuickGuessSlot("single", slot)}
              />
            </div>
            <div className="bet-array">
              {[
                { label: "A", value: singleA, onChange: setSingleA, amount: amountA, setAmount: setAmountA, color: "red" },
                { label: "B", value: singleB, onChange: setSingleB, amount: amountB, setAmount: setAmountB, color: "orange" },
                { label: "C", value: singleC, onChange: setSingleC, amount: amountC, setAmount: setAmountC, color: "blue" },
              ].map((item) => (
                <div key={item.label} className="bet-row">
                  <div className={`bet-letter ${item.color}`}>{item.label}</div>
                  <input
                    className="bet-input"
                    maxLength={1}
                    value={item.value}
                    onChange={(e) => item.onChange(e.target.value)}
                    placeholder="-"
                  />
                  <input
                    className="bet-amount"
                    placeholder="-"
                    type="number"
                    value={item.amount}
                    onChange={(e) => item.setAmount(e.target.value)}
                  />
                  <button type="button" className="bet-add-btn" onClick={() => addSingle(item.label, item.value, item.amount)}>ADD</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bet-section">
            <div className="bet-section-head">
              <div className="bet-section-title">
                <strong>Double Digit</strong>
                <span>₹11.00</span>
                <span className="win-pill">Win ₹1,000.00</span>
              </div>
              <QuickGuessControl
                section="double"
                selectedSlot={quickGuessSlots.double}
                isOpen={openQuickGuess === "double"}
                onToggle={() => setOpenQuickGuess((current) => current === "double" ? null : "double")}
                onSelect={(slot) => selectQuickGuessSlot("double", slot)}
              />
            </div>
            <div className="bet-array">
              {[
                { label: "AB", value: doubleAB, onChange: setDoubleAB, amount: amountAB, setAmount: setAmountAB },
                { label: "AC", value: doubleAC, onChange: setDoubleAC, amount: amountAC, setAmount: setAmountAC },
                { label: "BC", value: doubleBC, onChange: setDoubleBC, amount: amountBC, setAmount: setAmountBC },
              ].map((item) => (
                <div key={item.label} className="bet-row">
                  <div className="double-pair">
                    <div className="bet-letter red">{item.label[0]}</div>
                    <div className="bet-letter orange">{item.label[1]}</div>
                    <input
                      className="bet-input"
                      maxLength={2}
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      placeholder="-"
                    />
                    <input
                      className="bet-amount"
                      placeholder="-"
                      type="number"
                      value={item.amount}
                      onChange={(e) => item.setAmount(e.target.value)}
                    />
                    <button type="button" className="bet-add-btn" onClick={() => addDouble(item.label, item.value, item.amount)}>ADD</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bet-section">
            <div className="bet-section-head">
              <div className="bet-section-title">
                <strong>Triple Digit</strong>
                <span>₹29.00</span>
                <span className="win-pill">Win ₹15,000.00</span>
              </div>
              <QuickGuessControl
                section="triple"
                selectedSlot={quickGuessSlots.triple}
                isOpen={openQuickGuess === "triple"}
                onToggle={() => setOpenQuickGuess((current) => current === "triple" ? null : "triple")}
                onSelect={(slot) => selectQuickGuessSlot("triple", slot)}
              />
            </div>
            <div className="triple-controls">
              <div className="triple-labels" aria-hidden="true">
                <div className="bet-letter red">A</div>
                <div className="bet-letter orange">B</div>
                <div className="bet-letter blue">C</div>
              </div>
              <div className="triple-digit-inputs">
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    className="triple-digit-input"
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    value={tripleABC[index] || ""}
                    onChange={(e) => updateTripleDigit(index, e.target.value)}
                    placeholder="-"
                    aria-label={`Triple Digit ${index + 1}`}
                  />
                ))}
              </div>
              <div className="triple-actions">
                <input
                  className="bet-amount"
                  type="number"
                  value={tripleAmount}
                  onChange={(e) => setTripleAmount(e.target.value)}
                  placeholder="-"
                />
                <button type="button" className={`bet-box-button ${tripleType === "Box" ? "active" : ""}`} onClick={() => setTripleType("Box")}>BOX</button>
                <button type="button" className="bet-add-btn" onClick={addTriple}>ADD</button>
              </div>
            </div>
          </div>

          <div className="lottery-cart-bar">
            <div>
              <div className="cart-total">
                <span className="cart-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 8h14v11H5z" fill="currentColor" />
                    <path d="M8 8V6.5a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="m8 12 3 3 5-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>₹{Number(totalAmount).toFixed(2)}</span>
              </div>
              <div className="cart-meta">{orders.length} numbers</div>
            </div>
            <button type="button" className="pay-now-btn" onClick={buyTicket}>Pay Now</button>
          </div>
          </div>
        ) : null}
      </div>
      {isHowToPlayOpen ? (
        <div className="how-to-play-overlay" role="presentation" onClick={() => setIsHowToPlayOpen(false)}>
          <section className="how-to-play-modal" role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" onClick={(event) => event.stopPropagation()}>
            <div className="how-to-play-modal-header">
              <h2 id="how-to-play-title">How to play</h2>
              <button type="button" className="how-to-play-close" aria-label="Close How to play" onClick={() => setIsHowToPlayOpen(false)}>×</button>
            </div>
            <ol className="how-to-play-list">
              <li>Choose a Quick Guess time slot for the bet section.</li>
              <li>Enter your number and amount for A, B, or C.</li>
              <li>Use BOX for a Triple Digit combination when needed.</li>
              <li>Tap ADD to place the selection in your bet slip.</li>
              <li>Review the total and tap Pay Now to purchase your ticket.</li>
            </ol>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default LotteryGame;
