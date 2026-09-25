import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import API, { getAuthToken } from "../services/api";
import { resolveLotteryImage } from "../components/LotteryCard";
import "./LotteryGame.css";

const LETTER_COLORS = { A: "red", B: "orange", C: "blue" };
const PLAY_DURATIONS = [
  { value: "1", label: "1 Min" },
  { value: "3", label: "3 Min" },
  { value: "5", label: "5 Min" },
];
const groups = [
  { key: "single", title: "Single Digit", labels: ["A", "B", "C"], maxLength: 1, amountKey: "singleDigitAmount", winningAmountKey: "singleDigitWinningAmount" },
  { key: "double", title: "Double Digit", labels: ["A+B", "A+C", "B+C"], maxLength: 2, amountKey: "doubleDigitAmount", winningAmountKey: "doubleDigitWinningAmount" },
  { key: "triple", title: "Triple Digit", labels: ["A+B+C"], maxLength: 3, amountKey: "tripleDigitAmount", winningAmountKey: "tripleDigitWinningAmount" },
];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function getLotteryTimeParts(drawDate) {
  if (!drawDate) return null;
  const parsed = new Date(drawDate);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);
  const read = (type) => Number(parts.find((part) => part.type === type)?.value);
  const hour = read("hour");
  const minute = read("minute");
  return Number.isFinite(hour) && Number.isFinite(minute) ? { hour, minute } : null;
}

function getTodayLotteryDrawTimestamp(drawDate, now = new Date()) {
  const timeParts = getLotteryTimeParts(drawDate);
  if (!timeParts) return 0;

  const target = new Date(now);
  target.setHours(timeParts.hour, timeParts.minute, 0, 0);
  return target.getTime();
}

function formatLocalDrawTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDrawDate(drawDate) {
  if (!drawDate) return "Date unavailable";
  const parsed = new Date(drawDate);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function ClockIcon() {
  return (
    <svg className="lottery-countdown-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5l3.1 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LotteryArtwork({ lottery }) {
  const imageSrc = resolveLotteryImage(lottery);
  const name = String(lottery?.lotteryName || lottery?.name || "Lottery");
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "LH";

  return (
    <div className="lottery-game-artwork" aria-label={`${name} artwork`}>
      {imageSrc ? <img src={imageSrc} alt="" /> : <span aria-hidden="true">{initials}</span>}
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
  const { balance, refreshWallet } = useWallet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedLotteryId = searchParams.get("lotteryId");
  const token = getAuthToken();
  const { notify } = useNotification();
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [availableLotteries, setAvailableLotteries] = useState([]);
  const [drawRefreshKey, setDrawRefreshKey] = useState(0);
  const [entryAmounts, setEntryAmounts] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(selectedLotteryId));
  const [confirming, setConfirming] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [values, setValues] = useState({ single: {}, double: {}, triple: {} });
  const [quantities, setQuantities] = useState({ single: {}, double: {}, triple: {} });
  const [orders, setOrders] = useState([]);
  const [playDuration, setPlayDuration] = useState("3");
  const [selectedDrawDate, setSelectedDrawDate] = useState("");
  const [tripleType, setTripleType] = useState("Box");
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [quickGuessOpen, setQuickGuessOpen] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const previousSelectedStatus = useRef(null);

  useEffect(() => {
    previousSelectedStatus.current = null;
  }, [selectedLotteryId]);

  useEffect(() => {
    let mounted = true;

    async function loadAvailableLotteries() {
      try {
        const response = await API.get("/lottery/all");

        if (!mounted) return;

        const draws = Array.isArray(response.data?.data) ? response.data.data : [];

        setAvailableLotteries(draws);
        setDrawRefreshKey((current) => current + 1);

        if (!selectedLotteryId && draws.length) {
          const nextDraw = draws.find((draw) => draw.drawStatus === "UPCOMING") || draws[0];
          navigate(`/lotterygame?lotteryId=${nextDraw.id}`, { replace: true });
        } else if (selectedLotteryId) {
          const selectedDraw = draws.find(
            (draw) => String(draw.id) === String(selectedLotteryId)
          );

          const nextDraw = draws.find(
            (draw) => draw.drawStatus === "UPCOMING"
          );

          if (
            previousSelectedStatus.current === "UPCOMING" &&
            selectedDraw?.drawStatus !== "UPCOMING" &&
            nextDraw
          ) {
            navigate(`/lotterygame?lotteryId=${nextDraw.id}`, { replace: true });
          }

          previousSelectedStatus.current = selectedDraw?.drawStatus || null;
        }
      } catch (error) {
        if (mounted) {
          setLoadError(
            error.response?.data?.message || "Unable to load available draws."
          );
        }
      }
    }

    loadAvailableLotteries();

    const refreshTimer = window.setInterval(
      loadAvailableLotteries,
      30000
    );

    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [navigate, selectedLotteryId]);

  useEffect(() => {
    let mounted = true;

    async function loadLottery() {
      if (!selectedLotteryId) {
        setSelectedLottery(null);
        setIsLoading(availableLotteries.length === 0);
        return;
      }

      setIsLoading(true);
      setLoadError("");
      setSelectedLottery(null);

      try {
        const [lotteryResponse, amountsResponse] = await Promise.all([
          API.get(`/lottery/${selectedLotteryId}`),
          API.get("/lottery/entry-amounts"),
        ]);

        if (!mounted) return;

        const lotteryData =
          lotteryResponse.data?.data ??
          lotteryResponse.data?.lottery ??
          null;

        if (!lotteryData || typeof lotteryData !== "object") {
          throw new Error("Lottery not found");
        }

        setSelectedLottery(lotteryData);
        setEntryAmounts(amountsResponse.data?.data || null);
      } catch (error) {
        if (mounted) {
          setSelectedLottery(null);
          setLoadError(
            error.response?.data?.message ||
            "Unable to load lottery details."
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadLottery();

    return () => {
      mounted = false;
    };
  }, [availableLotteries.length, selectedLotteryId, drawRefreshKey]);

  useEffect(() => {
    let mounted = true;

    async function loadMyTickets() {
      if (!selectedLotteryId || !token) return;

      setTicketsLoading(true);
      setTicketsError("");

      try {
        const response = await API.get("/ticket/mytickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mounted) return;

        const all = Array.isArray(response.data?.tickets)
          ? response.data.tickets
          : [];

        setMyTickets(
          all.filter(
            (ticket) =>
              String(ticket.LotteryId) === String(selectedLotteryId)
          )
        );
      } catch (error) {
        if (mounted) {
          setTicketsError(
            error.response?.data?.message ||
            "Unable to load your orders."
          );
        }
      } finally {
        if (mounted) setTicketsLoading(false);
      }
    }

    loadMyTickets();

    return () => {
      mounted = false;
    };
  }, [selectedLotteryId, token]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setOrders([]);
    setValues({ single: {}, double: {}, triple: {} });
    setQuantities({ single: {}, double: {}, triple: {} });
  }, [selectedLotteryId]);

  const drawSchedule = Array.isArray(selectedLottery?.drawSchedule)
    ? selectedLottery.drawSchedule
    : [];

  useEffect(() => {
    setSelectedDrawDate((current) => {
      if (drawSchedule.some((draw) => draw.drawDate === current)) {
        return current;
      }

      const nextDraw = drawSchedule
        .filter(
          (draw) =>
            new Date(draw.drawDate).getTime() > Date.now()
        )
        .sort(
          (a, b) =>
            new Date(a.drawDate).getTime() -
            new Date(b.drawDate).getTime()
        )[0];

      return nextDraw?.drawDate || drawSchedule[0]?.drawDate || "";
    });
  }, [
    selectedLottery?.id,
    drawSchedule.map((draw) => draw.drawDate).join("|"),
  ]);

  const selectedScheduleDraw =
    drawSchedule.find(
      (draw) => draw.drawDate === selectedDrawDate
    ) || drawSchedule[0];

  const displayDrawDate =
    selectedScheduleDraw?.drawDate || selectedLottery?.drawDate;

  const drawTime = selectedLottery
    ? selectedScheduleDraw?.drawDate
      ? new Date(selectedScheduleDraw.drawDate).getTime()
      : getTodayLotteryDrawTimestamp(
          selectedLottery.drawDate,
          new Date(now)
        )
    : 0;

  const secondsLeft = drawTime
    ? Math.max(0, Math.ceil((drawTime - now) / 1000))
    : 0;

  const drawLabel = drawTime
    ? formatLocalDrawTime(drawTime)
    : "Next draw";

  const totalAmount = orders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  const totalEntries = orders.reduce(
    (sum, order) => sum + order.quantity,
    0
  );

  const progress = drawTime > now ? 100 : 0;
  const availableBalance = Number(balance || 0);

  function unitAmount(group) {
    return Number(entryAmounts?.[group.amountKey] || 0);
  }

  function winningAmount(group) {
    return Number(entryAmounts?.[group.winningAmountKey] || 0);
  }

  function setValue(group, label, value) {
    const maxLength =
      groups.find((item) => item.key === group)?.maxLength || 1;

    setValues((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [label]: value.replace(/\D/g, "").slice(0, maxLength),
      },
    }));
  }

  function setQuantity(group, label, quantity) {
    setQuantities((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [label]: quantity,
      },
    }));
  }

  function addEntry(groupKey, label) {
    const group = groups.find((item) => item.key === groupKey);
    const number = values[groupKey][label] || "";
    const quantity = quantities[groupKey][label] || 0;
    const amountEach = unitAmount(group);

    if (!amountEach) {
      notify(
        "warning",
        "Lottery entry amounts are not configured yet."
      );
      return;
    }

    if (number.length !== group.maxLength) {
      notify(
        "warning",
        `Enter ${group.maxLength} digit${group.maxLength > 1 ? "s" : ""} for ${label}.`
      );
      return;
    }

    if (!quantity) {
      notify(
        "warning",
        "Increase the quantity before adding."
      );
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

    setValues((current) => ({
      ...current,
      [group.key]: {
        ...current[group.key],
        ...nextValues,
      },
    }));

    setQuickGuessOpen("");
    notify("success", `${group.title} numbers filled.`);
  }

  async function placeEntries() {
    if (!orders.length) {
      notify(
        "warning",
        "Add at least one lottery entry first."
      );
      return;
    }

    if (totalAmount > availableBalance) {
      notify(
        "error",
        "Insufficient wallet balance. Please add cash to continue."
      );
      return;
    }

    setConfirming(true);

    try {
      await API.post(
        "/lottery/entries",
        {
          lotteryId: Number(selectedLottery.id),
          entries: orders.map((order) => ({
            betType: order.game.toUpperCase(),
            selectedNumber: order.number,
            quantity: order.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = await refreshWallet();

      setOrders([]);

      notify(
        "success",
        `Entries confirmed. Balance: ${formatCredits(
          updated?.wallet ?? availableBalance - totalAmount
        )}`
      );
    } catch (error) {
      notify(
        "error",
        error.response?.data?.message ||
          "Unable to place lottery entries."
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="page-content lottery-page">
      <div className="lottery-mobile-shell">
        <div className="lottery-mobile-header">
          <button
            type="button"
            className="lottery-mobile-back"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <div className="lottery-mobile-title-wrap">
            <LotteryArtwork lottery={selectedLottery} />
            <div className="lottery-mobile-title">
              {selectedLottery?.lotteryName || "Lottery"}
            </div>
          </div>

          <div className="lottery-mobile-balance">
            <span className="lottery-balance-label">
              Wallet
            </span>
            <span className="lottery-balance-value">
              ₹{formatCredits(availableBalance)}
            </span>
            <span className="lottery-wallet-icon">
              ▰
            </span>
          </div>
        </div>

        {!selectedLotteryId ||
        isLoading ||
        !selectedLottery ? (
          <div className="lottery-empty-state">
            <h2>
              {isLoading
                ? "Loading lottery details..."
                : "Lottery unavailable"}
            </h2>

            <p>
              {loadError ||
                "Please choose a draw to continue."}
            </p>

            <button
              type="button"
              className="lottery-back-btn"
              onClick={() => navigate("/lottery")}
            >
              Browse lotteries
            </button>
          </div>
        ) : (
          <div className="lottery-bet-panel">
            {drawSchedule.length > 0 && (
              <div
                className="lottery-draw-selector"
                aria-label="Available lottery draws"
              >
                {drawSchedule.map((draw) => (
                  <button
                    type="button"
                    key={draw.drawDate}
                    className={`lottery-draw-card ${
                      draw.drawDate ===
                      selectedScheduleDraw?.drawDate
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedDrawDate(draw.drawDate)
                    }
                    aria-pressed={
                      draw.drawDate ===
                      selectedScheduleDraw?.drawDate
                    }
                    aria-label={`Deer Lottery, ${draw.time}`}
                  >
                    <span className="lottery-draw-card-time">
                      <span aria-hidden="true">
                        ◷
                      </span>{" "}
                      {draw.time}
                    </span>

                    <span className="lottery-draw-card-status">
                      {draw.drawStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="lottery-countdown-box">
              <div className="lottery-countdown-leading">
                <button
                  type="button"
                  className="lottery-pill ghost"
                  onClick={() =>
                    setHowToPlayOpen(true)
                  }
                >
                  How to play
                </button>

                <div className="lottery-type-indicators">
                  <Letter label="A" color="red" />
                  <Letter label="B" color="orange" />
                  <Letter label="C" color="blue" />
                </div>
              </div>

              <div className="lottery-countdown-separator" />

              <div>
                <div className="lottery-countdown-label">
                  <ClockIcon />
                  <span>Time remaining</span>
                </div>

                <div
                  className="timer"
                  aria-label={`Time remaining ${formatTime(secondsLeft)}`}
                >
                  {formatTime(secondsLeft)
                    .split("")
                    .map((character, index) =>
                      character === ":" ? (
                        <span
                          className="timer-separator"
                          key={`timer-separator-${index}`}
                        >
                          :
                        </span>
                      ) : (
                        <span
                          className="timer-digit"
                          key={`timer-digit-${index}`}
                        >
                          {character}
                        </span>
                      )
                    )}
                </div>

                <div className="suffix">
                  {drawLabel}
                </div>
              </div>

              <div className="lottery-progress">
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="lottery-selected-draw-meta">
              <span>
                Draw {formatDrawDate(displayDrawDate)}
              </span>

              <span>
                {selectedLottery.drawStatus ||
                  "UPCOMING"}
              </span>
            </div>

            <section
              className="lottery-duration-selector"
              aria-label="Play duration"
            >
              <span className="lottery-duration-label">
                Play Duration
              </span>

              <div className="lottery-duration-options">
                {PLAY_DURATIONS.map((duration) => (
                  <button
                    type="button"
                    key={duration.value}
                    className={
                      playDuration === duration.value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPlayDuration(duration.value)
                    }
                    aria-pressed={
                      playDuration === duration.value
                    }
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </section>

            {groups.map((group) => (
              <section
                className="bet-section"
                key={group.key}
              >
                <div className="bet-section-head">
                  <div className="bet-section-title">
                    <strong>{group.title}</strong>

                    <span className="win-pill">
                      Win ₹
                      {formatCredits(
                        winningAmount(group)
                      )}
                    </span>

                    <span>
                      ₹
                      {formatCredits(
                        unitAmount(group)
                      )}
                    </span>
                  </div>

                  <div className="quick-guess-control">
                    <button
                      type="button"
                      className={`quick-guess ${
                        quickGuessOpen === group.key
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setQuickGuessOpen(
                          (current) =>
                            current === group.key
                              ? ""
                              : group.key
                        )
                      }
                    >
                      Quick Guess
                    </button>

                    {quickGuessOpen ===
                      group.key && (
                      <div className="quick-guess-slots">
                        <button
                          type="button"
                          className="quick-guess-slot selected"
                          onClick={() =>
                            applyQuickGuess(group)
                          }
                        >
                          Fill numbers
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bet-array">
                  {group.labels.map((label) => (
                    <div
                      className="bet-row"
                      key={label}
                    >
                      <LetterGroup label={label} />

                      <input
                        className="bet-input"
                        maxLength={group.maxLength}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={
                          values[group.key][label] ||
                          ""
                        }
                        onChange={(event) =>
                          setValue(
                            group.key,
                            label,
                            event.target.value
                          )
                        }
                        placeholder="-"
                        aria-label={`${label} number`}
                        readOnly={false}
                      />

                      <QuantityControl
                        quantity={
                          quantities[group.key][label] ||
                          0
                        }
                        onChange={(quantity) =>
                          setQuantity(
                            group.key,
                            label,
                            quantity
                          )
                        }
                      />

                      {group.key === "triple" && (
                        <button
                          type="button"
                          className={`bet-box-button ${
                            tripleType === "Box"
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setTripleType(
                              (current) =>
                                current === "Box"
                                  ? "Straight"
                                  : "Box"
                            )
                          }
                        >
                          BOX
                        </button>
                      )}

                      <button
                        type="button"
                        className="bet-add-btn"
                        onClick={() =>
                          addEntry(group.key, label)
                        }
                      >
                        ADD
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="lottery-cart-bar">
              <div>
                <div className="cart-total">
                  <span className="cart-icon">
                    ▾
                  </span>

                  <span>
                    {formatCredits(totalAmount)} credits
                  </span>
                </div>

                <div className="cart-meta">
                  {totalEntries} selected{" "}
                  {totalEntries === 1
                    ? "entry"
                    : "entries"}
                </div>
              </div>

              <button
                type="button"
                className="pay-now-btn"
                disabled={confirming}
                onClick={placeEntries}
              >
                {confirming
                  ? "Processing..."
                  : "Pay Now"}
              </button>
            </div>

            <section className="lottery-history-panel">
              <div className="lottery-tabs">
                <button
                  type="button"
                  className={
                    activeTab === "history"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("history")
                  }
                >
                  Result history
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "order"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("order")
                  }
                >
                  My order
                </button>
              </div>

              {activeTab === "history" ? (
                selectedLottery.winningResults
                  ?.length ? (
                  <div className="lottery-history-list">
                    {selectedLottery.winningResults.map(
                      (result) => (
                        <div
                          className="lottery-history-row"
                          key={
                            result.id ||
                            `${result.betType}-${result.winningNumber}`
                          }
                        >
                          <span>
                            {result.betType}
                          </span>

                          <strong>
                            {result.winningNumber}
                          </strong>

                          <span>
                            ₹
                            {formatCredits(
                              result.prizeAmount
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="lottery-empty-note">
                    Result not declared yet for this
                    draw.
                  </p>
                )
              ) : ticketsLoading ? (
                <p className="lottery-empty-note">
                  Loading your orders...
                </p>
              ) : ticketsError ? (
                <p className="lottery-empty-note">
                  {ticketsError}
                </p>
              ) : myTickets.length ? (
                <div className="lottery-history-list">
                  {myTickets.map((ticket) => (
                    <div
                      className="lottery-history-row"
                      key={ticket.id}
                    >
                      <span>
                        {ticket.betType} ·{" "}
                        {ticket.selectedNumber}
                      </span>

                      <strong>
                        ₹
                        {formatCredits(
                          ticket.amount
                        )}
                      </strong>

                      <span>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lottery-empty-note">
                  You have not placed any orders for
                  this draw yet.
                </p>
              )}
            </section>
          </div>
        )}

        {howToPlayOpen && (
          <div
            className="how-to-play-overlay"
            role="presentation"
            onClick={() =>
              setHowToPlayOpen(false)
            }
          >
            <section
              className="how-to-play-modal"
              role="dialog"
              aria-modal="true"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="how-to-play-modal-header">
                <h2>How to play</h2>

                <button
                  type="button"
                  className="how-to-play-close"
                  onClick={() =>
                    setHowToPlayOpen(false)
                  }
                >
                  ×
                </button>
              </div>

              <ol className="how-to-play-list">
                <li>
                  Each digit type uses the credit
                  amount configured by Admin.
                </li>
                <li>
                  Enter digits for A, B, C, A+B,
                  A+C, B+C, or A+B+C.
                </li>
                <li>
                  Set quantity with − / +. Total =
                  configured amount × quantity.
                </li>
                <li>
                  Tap ADD, then Pay Now using your
                  credit balance.
                </li>
              </ol>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default LotteryGame;