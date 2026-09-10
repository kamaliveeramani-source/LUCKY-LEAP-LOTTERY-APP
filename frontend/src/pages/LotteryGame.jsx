import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import API, { getAuthToken } from "../services/api";
import "./LotteryGame.css";

const LETTER_COLORS = { A: "red", B: "orange", C: "blue" };
const groups = [
  { key: "single", title: "Single Digit", labels: ["A", "B", "C"], maxLength: 1, amountKey: "singleDigitAmount" },
  { key: "double", title: "Double Digit", labels: ["A+B", "A+C", "B+C"], maxLength: 2, amountKey: "doubleDigitAmount" },
  { key: "triple", title: "Triple Digit", labels: ["A+B+C"], maxLength: 3, amountKey: "tripleDigitAmount" },
];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function formatCredits(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function randomDigits(length) {
  return Array.from({ length }, () => String(Math.floor(Math.random() * 10))).join("");
}

function Letter({ label, color }) {
  return <span className={`bet-letter ${color}`}>{label}</span>;
}

function LetterGroup({ label }) {
  const parts = label.split("+");
  return (
    <div className={parts.length > 1 ? "double-pair" : "bet-letter-wrap"}>
      {parts.map((letter, index) => (
        <span key={`${label}-${letter}-${index}`} className="letter-cluster">
          {index > 0 && <span className="bet-plus">+</span>}
          <Letter label={letter} color={LETTER_COLORS[letter] || "blue"} />
        </span>
      ))}
    </div>
  );
}

function QuantityControl({ quantity, onChange }) {
  return (
    <div className="lottery-quantity" aria-label="Quantity">
      <button type="button" onClick={() => onChange(Math.max(0, quantity - 1))} aria-label="Decrease quantity">−</button>
      <span>{quantity}</span>
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}

function LotteryGame() {
  const { demoBalance, refreshWallet } = useWallet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedLotteryId = searchParams.get("lotteryId");
  const token = getAuthToken();
  const { notify } = useNotification();
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [entryAmounts, setEntryAmounts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [values, setValues] = useState({ single: {}, double: {}, triple: {} });
  const [quantities, setQuantities] = useState({ single: {}, double: {}, triple: {} });
  const [orders, setOrders] = useState([]);
  const [tripleType, setTripleType] = useState("Box");
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [quickGuessOpen, setQuickGuessOpen] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadLottery() {
      if (!selectedLotteryId) {
        setSelectedLottery(null);
        setLoadError("No lottery selected. Please choose a draw from the lottery list.");
        return;
      }
      setIsLoading(true);
      setLoadError("");
      try {
        const [lotteryResponse, amountsResponse] = await Promise.all([
          API.get(`/lottery/${selectedLotteryId}`),
          API.get("/lottery/entry-amounts"),
        ]);
        if (!mounted) return;
        if (!lotteryResponse.data?.data) throw new Error("Lottery not found");
        setSelectedLottery(lotteryResponse.data.data);
        setEntryAmounts(amountsResponse.data?.data || null);
      } catch (error) {
        if (mounted) {
          setSelectedLottery(null);
          setLoadError(error.response?.data?.message || "Unable to load lottery details.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadLottery();
    return () => { mounted = false; };
  }, [selectedLotteryId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const drawTime = selectedLottery?.drawDate ? new Date(selectedLottery.drawDate).getTime() : 0;
  const secondsLeft = drawTime > now ? Math.ceil((drawTime - now) / 1000) : 0;
  const drawLabel = selectedLottery?.drawDate ? new Date(selectedLottery.drawDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Next draw";
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalEntries = orders.reduce((sum, order) => sum + order.quantity, 0);
  const progress = drawTime > now ? Math.min(100, Math.max(0, ((drawTime - now) / (60 * 60 * 1000)) * 100)) : 0;
  const availableCredits = Number(demoBalance || 0);

  function unitAmount(group) {
    return Number(entryAmounts?.[group.amountKey] || 0);
  }

  function setValue(group, label, value) {
    const maxLength = groups.find((item) => item.key === group)?.maxLength || 1;
    setValues((current) => ({ ...current, [group]: { ...current[group], [label]: value.replace(/\D/g, "").slice(0, maxLength) } }));
  }

  function setQuantity(group, label, quantity) {
    setQuantities((current) => ({ ...current, [group]: { ...current[group], [label]: quantity } }));
  }

  function addEntry(groupKey, label) {
    const group = groups.find((item) => item.key === groupKey);
    const number = values[groupKey][label] || "";
    const quantity = quantities[groupKey][label] || 0;
    const amountEach = unitAmount(group);
    if (!amountEach) {
      notify("warning", "Lottery entry amounts are not configured yet.");
      return;
    }
    if (number.length !== group.maxLength) {
      notify("warning", `Enter ${group.maxLength} digit${group.maxLength > 1 ? "s" : ""} for ${label}.`);
      return;
    }
    if (!quantity) {
      notify("warning", "Increase the quantity before adding.");
      return;
    }
    setOrders((current) => [
      ...current,
      {
        id: `${groupKey}-${label}-${Date.now()}`,
        game: groupKey,
        type: label,
        number,
        quantity,
        amount: Number((amountEach * quantity).toFixed(2)),
      },
    ]);
    notify("success", `${label} entry added.`);
  }

  function applyQuickGuess(group) {
    const nextValues = {};
    group.labels.forEach((label) => {
      nextValues[label] = randomDigits(group.maxLength);
    });
    setValues((current) => ({ ...current, [group.key]: { ...current[group.key], ...nextValues } }));
    setQuickGuessOpen("");
    notify("success", `${group.title} numbers filled.`);
  }

  async function placeEntries() {
    if (!orders.length) {
      notify("warning", "Add at least one lottery entry first.");
      return;
    }
    if (totalAmount > availableCredits) {
      notify("error", "Insufficient credits");
      return;
    }
    setConfirming(true);
    try {
      await API.post("/lottery/entries", {
        lotteryId: Number(selectedLottery.id),
        entries: orders.map((order) => ({
          betType: order.game.toUpperCase(),
          selectedNumber: order.number,
          quantity: order.quantity,
        })),
      }, { headers: { Authorization: `Bearer ${token}` } });
      const updated = await refreshWallet();
      setOrders([]);
      notify("success", `Entries confirmed. Balance: ${formatCredits(updated?.demoBalance ?? availableCredits - totalAmount)}`);
    } catch (error) {
      notify("error", error.response?.data?.message || "Unable to place lottery entries.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="page-content lottery-page">
      <div className="lottery-mobile-shell">
        <div className="lottery-mobile-header">
          <button type="button" className="lottery-mobile-back" aria-label="Back" onClick={() => navigate(-1)}>←</button>
          <div className="lottery-mobile-title">{selectedLottery?.lotteryName || "Kerala Lottery"}</div>
          <div className="lottery-mobile-balance">
            <span className="lottery-balance-label">Credits</span>
            <span className="lottery-balance-value">{formatCredits(availableCredits)}</span>
            <span className="lottery-wallet-icon">▰</span>
          </div>
        </div>
        {!selectedLotteryId || isLoading || !selectedLottery ? (
          <div className="lottery-empty-state">
            <h2>{isLoading ? "Loading lottery details..." : "Lottery unavailable"}</h2>
            <p>{loadError || "Please choose a draw to continue."}</p>
            <button type="button" className="lottery-back-btn" onClick={() => navigate("/lottery")}>Browse lotteries</button>
          </div>
        ) : (
          <div className="lottery-bet-panel">
            <div className="lottery-countdown-box">
              <div className="lottery-countdown-leading">
                <button type="button" className="lottery-pill ghost" onClick={() => setHowToPlayOpen(true)}>How to play</button>
                <div className="lottery-type-indicators">
                  <Letter label="A" color="red" />
                  <Letter label="B" color="orange" />
                  <Letter label="C" color="blue" />
                </div>
              </div>
              <div className="lottery-countdown-separator" />
              <div>
                <div className="label">Time remaining</div>
                <div className="timer" aria-label={`Time remaining ${formatTime(secondsLeft)}`}>
                  {formatTime(secondsLeft).split("").map((character, index) => (
                    character === ":"
                      ? <span className="timer-separator" key={index}>:</span>
                      : <span className="timer-digit" key={index}>{character}</span>
                  ))}
                </div>
                <div className="suffix">{drawLabel}</div>
              </div>
              <div className="lottery-progress"><span style={{ width: `${progress}%` }} /></div>
            </div>
            {groups.map((group) => (
              <section className="bet-section" key={group.key}>
                <div className="bet-section-head">
                  <div className="bet-section-title">
                    <strong>{group.title}</strong>
                    <span>{formatCredits(unitAmount(group))} credits each</span>
                  </div>
                  <div className="quick-guess-control">
                    <button type="button" className={`quick-guess ${quickGuessOpen === group.key ? "active" : ""}`} onClick={() => setQuickGuessOpen((current) => current === group.key ? "" : group.key)}>Quick Guess</button>
                    {quickGuessOpen === group.key && (
                      <div className="quick-guess-slots">
                        <button type="button" className="quick-guess-slot selected" onClick={() => applyQuickGuess(group)}>Fill numbers</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bet-array">
                  {group.labels.map((label) => (
                    <div className="bet-row" key={label}>
                      <LetterGroup label={label} />
                      <input
                        className="bet-input"
                        maxLength={group.maxLength}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={values[group.key][label] || ""}
                        onChange={(event) => setValue(group.key, label, event.target.value)}
                        placeholder="-"
                        aria-label={`${label} number`}
                        readOnly={false}
                      />
                      <QuantityControl quantity={quantities[group.key][label] || 0} onChange={(quantity) => setQuantity(group.key, label, quantity)} />
                      {group.key === "triple" && (
                        <button type="button" className={`bet-box-button ${tripleType === "Box" ? "active" : ""}`} onClick={() => setTripleType((current) => current === "Box" ? "Straight" : "Box")}>BOX</button>
                      )}
                      <button type="button" className="bet-add-btn" onClick={() => addEntry(group.key, label)}>ADD</button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div className="lottery-cart-bar">
              <div>
                <div className="cart-total">
                  <span className="cart-icon">▾</span>
                  <span>{formatCredits(totalAmount)} credits</span>
                </div>
                <div className="cart-meta">{totalEntries} selected {totalEntries === 1 ? "entry" : "entries"}</div>
              </div>
              <button type="button" className="pay-now-btn" disabled={confirming} onClick={placeEntries}>
                {confirming ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        )}
        {howToPlayOpen && (
          <div className="how-to-play-overlay" role="presentation" onClick={() => setHowToPlayOpen(false)}>
            <section className="how-to-play-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="how-to-play-modal-header">
                <h2>How to play</h2>
                <button type="button" className="how-to-play-close" onClick={() => setHowToPlayOpen(false)}>×</button>
              </div>
              <ol className="how-to-play-list">
                <li>Each digit type uses the credit amount configured by Admin.</li>
                <li>Enter digits for A, B, C, A+B, A+C, B+C, or A+B+C.</li>
                <li>Set quantity with − / +. Total = configured amount × quantity.</li>
                <li>Tap ADD, then Pay Now using your credit balance.</li>
              </ol>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default LotteryGame;
