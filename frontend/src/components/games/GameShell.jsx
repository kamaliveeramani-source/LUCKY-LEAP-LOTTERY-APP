import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthToken } from "../../services/api";

const DEFAULT_DURATIONS = ["1min", "3min", "5min", "10min", "15min"];
const roundIsOpen = (round, now = Date.now()) => round?.status === "OPEN" && new Date(round.startTime).getTime() <= now && new Date(round.endTime).getTime() > now;
const formatCountdown = (milliseconds) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

function CurrentRound({ round, remaining, result, onHowToPlay, accent }) {
  return <section className={`game-round-card ${accent}`}>
    <div className="game-round-copy"><span className="game-eyebrow">Current issue</span><strong>{round?.roundCode || "No active round"}</strong><span>{round ? "Selections are open" : "Waiting for the next issue"}</span><button type="button" className="game-how-button" onClick={onHowToPlay}>How to play</button></div>
    <div className="game-round-result"><span>Latest result</span><strong>{result || "-"}</strong></div>
    <div className="game-countdown"><span>Time remaining</span><strong>{round ? formatCountdown(remaining) : "--:--"}</strong><small>Next issue after close</small></div>
    <div className="game-progress"><span style={{ width: `${round ? Math.max(0, Math.min(100, remaining / Math.max(1, new Date(round.endTime).getTime() - new Date(round.startTime).getTime()) * 100)) : 0}%` }} /></div>
  </section>;
}

function History({ history, tabs, resultLabel = "Result" }) {
  const [tab, setTab] = useState(tabs[0]);
  return <section className="game-history-card"><div className="game-history-tabs">{tabs.map((item) => <button type="button" key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === tabs[0] ? <div className="game-history-table"><div className="game-history-head"><span>ISSUE</span><span>{resultLabel.toUpperCase()}</span><span>STATUS</span></div>{history.length ? history.map((round) => <div className="game-history-row" key={round.id}><span>{round.roundCode}</span><strong>{round.result?.winningValue || round.result?.winningOption?.label || round.result?.winningOption?.value || "-"}</strong><span>{round.result?.published ? "Published" : round.status}</span></div>) : <p className="game-empty">No published results yet.</p>}</div> : <p className="game-empty">{tab} is available when this game has published data.</p>}</section>;
}

export default function GameShell({ game, config, accent, rules, children, selectedValue, selectedLabel, selectedOption, submitValue, submitLabel = "Place demo selection", resultLabel = "Result", historyTabs = ["Result history", "Analyze", "My orders"] }) {
  const navigate = useNavigate();
  const token = getAuthToken();
  const durations = config.durationOptions || config.durations || DEFAULT_DURATIONS;
  const [duration, setDuration] = useState(durations[0]);
  const [rounds, setRounds] = useState([]);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState(Number(config.minAmount || 10));
  const [multiplier, setMultiplier] = useState(1);
  const [remaining, setRemaining] = useState(0);
  const [howToPlay, setHowToPlay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const currentRound = useMemo(() => rounds.find((round) => roundIsOpen(round)) || null, [rounds]);
  const currentResult = history[0]?.result?.winningValue || history[0]?.result?.winningOption?.label || history[0]?.result?.winningOption?.value || "-";
  const total = Number((amount * multiplier).toFixed(2));
  const refresh = useCallback(async () => {
    const [roundResponse, historyResponse] = await Promise.all([API.get(`/games/${game.id}/rounds`), API.get(`/games/${game.id}/history`)]);
    setRounds(roundResponse.data?.data || []); setHistory(historyResponse.data?.data || []);
    if (token) { const walletResponse = await API.get("/games/demo-wallet"); setBalance(Number(walletResponse.data?.data?.balance || 0)); }
  }, [game.id, token]);
  useEffect(() => { let mounted = true; setRounds([]); setHistory([]); setError(""); refresh().catch((requestError) => { if (mounted) setError(requestError.response?.data?.message || "Unable to load this game."); }); const timer = window.setInterval(() => refresh().catch(() => {}), 5000); return () => { mounted = false; window.clearInterval(timer); }; }, [refresh]);
  useEffect(() => { if (!currentRound) { setRemaining(0); return undefined; } const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(currentRound.endTime).getTime() - Date.now())), 1000); setRemaining(Math.max(0, new Date(currentRound.endTime).getTime() - Date.now())); return () => window.clearInterval(timer); }, [currentRound]);
  const submit = async () => {
    if (busy) return;
    if (!token) { setError("Sign in to play with demo credits."); return; }
    if (!currentRound) { setError("No active round"); return; }
    if ((submitValue === null || submitValue === undefined || submitValue === "") || !Number.isFinite(amount) || amount <= 0) { setError("Choose a selection and a valid demo amount."); return; }
    if (balance !== null && total > balance) { setError("Insufficient demo credits."); return; }
    setBusy(true); setError(""); setNotice("");
    try { await API.post(`/games/${game.id}/selections`, { roundId: currentRound.id, selectedValue: String(submitValue), GameOptionId: selectedOption?.id, stakeAmount: amount, multiplier }); setNotice("Demo selection placed successfully"); await refresh(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to place the demo selection."); } finally { setBusy(false); }
  };
  return <main className={`game-experience ${accent}`}>
    <header className="game-experience-header"><button type="button" className="game-back-button" onClick={() => navigate(-1)} aria-label="Go back">‹</button><div><span className="game-eyebrow">{game.category || "Demo game"}</span><h1>{game.name}</h1></div><span className="virtual-credit-indicator">{balance === null ? "Demo" : `${balance.toLocaleString("en-IN")} cr`}</span></header>
    <section className="game-duration-selector" aria-label="Game duration">{durations.map((item) => <button type="button" key={item} className={duration === item ? "active" : ""} onClick={() => setDuration(item)}>{item}</button>)}</section>
    <CurrentRound round={currentRound} remaining={remaining} result={currentResult} onHowToPlay={() => setHowToPlay(true)} accent={accent} />
    <section className="game-interaction-card"><div className="game-section-heading"><div><span className="game-eyebrow">{selectedLabel || "Make a selection"}</span><h2>{game.name}</h2></div><span className="game-selection-pill">{selectedValue !== null && selectedValue !== undefined && selectedValue !== "" ? String(selectedValue) : "Nothing selected"}</span></div>{children}<div className="game-stake-row"><label>Demo amount<input type="number" min={config.minAmount || 0.01} max={config.maxAmount || undefined} step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><label>Multiplier<select value={multiplier} onChange={(event) => setMultiplier(Number(event.target.value))}>{[1, 3, 9, 27, 81, 243, 729].map((item) => <option key={item} value={item}>x{item}</option>)}</select></label></div><div className="game-total-row"><span>Total demo credits</span><strong>{total.toLocaleString("en-IN")}</strong></div><button type="button" className="game-submit-button" disabled={!currentRound || (submitValue === null || submitValue === undefined || submitValue === "") || busy} onClick={submit}>{busy ? "Placing..." : submitLabel}</button>{notice && <p className="game-feedback success" role="status">{notice}</p>}{error && <p className="game-feedback error" role="alert">{error}</p>}<p className="game-demo-note">Virtual credits only. No deposits, withdrawals, or cash-out.</p></section>
    <History history={history} tabs={historyTabs} resultLabel={resultLabel} />
    {howToPlay && <div className="game-modal-backdrop" role="presentation" onClick={() => setHowToPlay(false)}><section className="game-rules-modal" role="dialog" aria-modal="true" aria-label="How to play" onClick={(event) => event.stopPropagation()}><button type="button" className="game-modal-close" onClick={() => setHowToPlay(false)} aria-label="Close">×</button><span className="game-eyebrow">How to play</span><h2>{game.name}</h2><p>{rules}</p><button type="button" className="game-submit-button" onClick={() => setHowToPlay(false)}>Got it</button></section></div>}
  </main>;
}
