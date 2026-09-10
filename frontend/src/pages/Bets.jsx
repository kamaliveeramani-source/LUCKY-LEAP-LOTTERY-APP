import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import API, { getAuthToken } from "../services/api";
import "./Bets.css";

const amounts = [10, 100, 500, 1000];
const multipliers = [1, 3, 9, 27, 81, 243, 729];
const ballColors = ["red", "green", "red", "green", "red", "green", "red", "green", "red", "green"];

function LotteryBall({ number, color = ballColors[number] }) {
  return <span className={`bets-ball bets-ball--${color}`}><span>{number}</span></span>;
}

function LotteryBanner() {
  return <section className="bets-banner" aria-label="Lottery promotion"><div className="bets-confetti" aria-hidden="true">✦　·　✧　·　✦</div><div><span className="bets-banner-kicker">Thumbi special</span><h1>Play &amp; Win Big!</h1><p>Pick your number. Feel the thrill.</p></div><div className="bets-banner-balls" aria-hidden="true"><LotteryBall number={3} color="green" /><LotteryBall number={7} color="red" /><LotteryBall number={8} color="yellow" /><span className="bets-coins">₹　₹　₹</span></div></section>;
}

function BetAmountSelector({ selected, onChange }) {
  return <section className="bets-panel"><div className="bets-panel-heading"><div><span className="bets-eyebrow">Choose your stake</span><h2>Bet amount</h2></div><span className="bets-panel-hint">Fast &amp; secure</span></div><div className="bets-amount-grid">{amounts.map((amount) => <button type="button" key={amount} className={selected === amount ? "selected" : ""} onClick={() => onChange(amount)}>₹{amount.toLocaleString("en-IN")}</button>)}</div></section>;
}

function MultiplierSelector({ selected, onChange }) {
  return <section className="bets-multiplier"><div className="bets-multiplier-heading"><strong>Multiplier</strong><div className="bets-stepper"><button type="button" onClick={() => onChange(Math.max(1, selected - 1))} aria-label="Decrease multiplier">−</button><span>{selected}</span><button type="button" onClick={() => onChange(Math.min(729, selected + 1))} aria-label="Increase multiplier">+</button></div></div><div className="bets-chip-row">{multipliers.map((multiplier) => <button type="button" key={multiplier} className={selected === multiplier ? "selected" : ""} onClick={() => onChange(multiplier)}>x{multiplier}</button>)}</div></section>;
}

function BetSummary({ selectedNumber, color, amount, multiplier, agreed, onAgree, onPlace, busy, disabled }) {
  const total = amount * multiplier;
  return <section className="bets-summary"><div className="bets-summary-title"><h2>My Bets</h2><button type="button" className="bets-link">Recent Bets <span>›</span></button></div><div className="bets-selected-preview"><LotteryBall number={selectedNumber} color={color} /><div><span>Selected number</span><strong>{selectedNumber}</strong><small>{String(color).toUpperCase()} ball</small></div></div><label className="bets-agreement"><input type="checkbox" checked={agreed} onChange={(event) => onAgree(event.target.checked)} /><span className="bets-checkmark">✓</span><span>I Agree <button type="button" className="bets-rules">(Pre-sale rules)</button></span></label><button type="button" className="bets-total-button" disabled={!agreed || disabled} onClick={onPlace}>{busy ? "Placing..." : `PLACE BET ₹${total.toLocaleString("en-IN")}`}</button></section>;
}

export default function Bets() {
  const location = useLocation();
  const [selection, setSelection] = useState(() => location.state || (() => { try { return JSON.parse(sessionStorage.getItem("demoBetSelection")) || null; } catch { return null; } })());
  const [selectedNumber, setSelectedNumber] = useState(selection?.selectedNumber ?? 0);
  const [selectedColor, setSelectedColor] = useState(selection?.selectedColor || ballColors[selection?.selectedNumber ?? 0]);
  const [amount, setAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1);
  const [agreed, setAgreed] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [demoBalance, setDemoBalance] = useState(null);
  const [activeRound, setActiveRound] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const [busy, setBusy] = useState(false);
  const numbers = useMemo(() => Array.from({ length: 10 }, (_, number) => number), []);
  const token = getAuthToken();

  useEffect(() => { if (location.state) { setSelection(location.state); sessionStorage.setItem("demoBetSelection", JSON.stringify(location.state)); } }, [location.state]);
  useEffect(() => { if (selection?.amount) setAmount(Number(selection.amount)); if (selection?.multiplier) setMultiplier(Number(selection.multiplier)); }, [selection]);
  const refreshData = useCallback(async () => {
    if (!selection?.gameId || !token) return;
    const [roundsResponse, walletResponse, betsResponse] = await Promise.all([API.get(`/games/${selection.gameId}/rounds`), API.get("/games/demo-wallet"), API.get(`/games/${selection.gameId}/selections`)]);
    const now = Date.now();
    setActiveRound((roundsResponse.data?.data || []).find((round) => round.status === "OPEN" && new Date(round.startTime).getTime() <= now && new Date(round.endTime).getTime() > now) || null);
    setDemoBalance(Number(walletResponse.data?.data?.balance || 0)); setMyBets(betsResponse.data?.data || []);
  }, [selection?.gameId, token]);
  useEffect(() => { refreshData().catch((requestError) => setError(requestError.response?.data?.message || "Unable to load demo game data.")); }, [refreshData]);
  function chooseNumber(number) { const option = selection?.options?.find((item) => Number(item.number) === number); setSelectedNumber(number); setSelectedColor(option?.color || option?.colour || ballColors[number]); setSelection((current) => ({ ...current, selectedNumber: number, selectedColor: option?.color || option?.colour || ballColors[number], selectedOption: option || current?.selectedOption })); }

  async function placeBet() {
    if (busy || !selection?.gameId || !token) return;
    setBusy(true); setNotice(""); setError("");
    try {
      await refreshData();
      const roundsResponse = await API.get(`/games/${selection.gameId}/rounds`); const now = Date.now();
      const round = (roundsResponse.data?.data || []).find((item) => item.status === "OPEN" && new Date(item.startTime).getTime() <= now && new Date(item.endTime).getTime() > now);
      if (!round) throw new Error("No active round");
      const response = await API.post(`/games/${selection.gameId}/selections`, { roundId: round.id, selectedValue: String(selectedNumber), selectedColor, GameOptionId: selection.selectedOption?.id, stakeAmount: amount, multiplier });
      setDemoBalance(Number(response.data?.data?.demoBalance)); setNotice("Demo bet placed successfully"); setSelection((current) => ({ ...current, roundId: round.id, roundCode: round.roundCode })); await refreshData();
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Unable to place the demo bet."); } finally { setBusy(false); }
  }

  return <main className="bets-page"><section className="bets-page-inner"><div className="bets-balance-spacer" aria-hidden="true" /><LotteryBanner /><section className="bets-card"><div className="bets-card-title"><h2>Bets</h2><button type="button" className="bets-close" aria-label="Close bets">×</button></div><div className="bets-preview"><LotteryBall number={selectedNumber} color={selectedColor} /><div><span>{selection?.gameName || "Green / Yellow / Red"}</span><strong>{selection?.roundCode || activeRound?.roundCode || "No active round"}</strong><small>{selectedColor.toUpperCase()} • Number {selectedNumber}</small></div></div><div className="bets-number-grid">{numbers.map((number) => <button type="button" key={number} className={selectedNumber === number ? "selected" : ""} onClick={() => chooseNumber(number)} aria-label={`Select number ${number}`}><LotteryBall number={number} color={selection?.options?.find((item) => Number(item.number) === number)?.color || ballColors[number]} /></button>)}</div></section><BetAmountSelector selected={amount} onChange={setAmount} /><MultiplierSelector selected={multiplier} onChange={setMultiplier} /><BetSummary selectedNumber={selectedNumber} color={selectedColor} amount={amount} multiplier={multiplier} agreed={agreed} onAgree={setAgreed} onPlace={placeBet} busy={busy} disabled={!activeRound || !selection?.gameId} />{error && <p className="bets-notice" role="alert">{error}</p>}{notice && <p className="bets-notice" role="status">{notice}</p>}<p className="bets-wallet-note">Demo balance: {demoBalance === null ? "Loading..." : `₹${demoBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}</p><section className="bets-summary"><div className="bets-summary-title"><h2>MY BETS</h2><span className="bets-panel-hint">{myBets.length} placed</span></div>{myBets.length ? myBets.map((bet) => <div className="bets-selected-preview" key={bet.id}><div><span>{bet.round}</span><strong>{bet.option}</strong><small>₹{bet.demoAmount.toLocaleString("en-IN")} • x{bet.multiplier} • {bet.status}</small></div></div>) : <p className="bets-wallet-note">No demo bets placed yet.</p>}</section></section></main>;
}
