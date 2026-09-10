import { useEffect, useState } from "react";
import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";
const apiBaseUrl = configuredApiUrl.replace(/\/$/, "").endsWith("/api") ? configuredApiUrl : `${configuredApiUrl.replace(/\/$/, "")}/api`;
const API = axios.create({ baseURL: apiBaseUrl });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BET_TYPES = ["SINGLE", "DOUBLE", "TRIPLE"];
const labels = { SINGLE: "Single Digit", DOUBLE: "Double Digit", TRIPLE: "Triple Digit" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateText = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "-";
const timeText = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

function emptyRows() { return BET_TYPES.map((betType) => ({ betType, winningNumber: "", prizeAmount: "" })); }

export default function WinnerSelection() {
  const [lotteries, setLotteries] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [rows, setRows] = useState(emptyRows());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const selected = lotteries.find((item) => String(item.id) === String(selectedId));
  const completed = selected?.drawStatus === "COMPLETED";
  const locked = !selected || completed;

  async function loadLotteries() {
    try {
      setLoading(true); setError("");
      const response = await API.get("/admin/lotteries");
      const data = response.data?.data || [];
      setLotteries(data);
      if (!selectedId && data[0]) setSelectedId(String(data[0].id));
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load lotteries."); }
    finally { setLoading(false); }
  }

  async function loadResults(id) {
    if (!id) return;
    try {
      const response = await API.get(`/admin/lotteries/${id}/winning-results`);
      const configured = response.data?.data?.results || [];
      setRows(BET_TYPES.map((betType) => { const result = configured.find((item) => item.betType === betType); return { betType, winningNumber: result?.winningNumber || "", prizeAmount: result?.prizeAmount || "" }; }));
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load winning results."); }
  }

  useEffect(() => { loadLotteries(); }, []);
  useEffect(() => { loadResults(selectedId); }, [selectedId]);
  function updateRow(index, field, value) { setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)); }
  function payload() { return rows.filter((row) => row.winningNumber !== "" || row.prizeAmount !== "").map((row) => ({ ...row, prizeAmount: Number(row.prizeAmount) })); }

  async function saveResults(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { await API.put(`/admin/lotteries/${selected.id}/winning-results`, { winningResults: payload() }); setNotice("Winning results saved."); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to save winning results."); }
    finally { setBusy(false); }
  }

  async function declareResults() {
    if (!window.confirm(`Declare and settle ${selected.lotteryName}? This cannot be undone.`)) return;
    setBusy(true); setError(""); setNotice("");
    try { await API.post(`/admin/lotteries/${selected.id}/winning-results`, { winningResults: payload() }); setNotice("Results declared and tickets settled."); await loadLotteries(); await loadResults(selected.id); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to declare winning results."); }
    finally { setBusy(false); }
  }

  return <><div className="page-header"><div><span className="eyebrow">Payouts</span><h1>Winner Selection</h1><p>Configure the winning number and prize for each applicable bet type.</p></div><button className="secondary-button" onClick={loadLotteries}>↻ Refresh</button></div>{notice && <div className="toast">{notice}</div>}{error && <div className="error-box">{error}</div>}{loading ? <div className="loading-state">Loading draws...</div> : <section className="panel winner-selection"><label>Lottery<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{lotteries.map((lottery) => <option key={lottery.id} value={lottery.id}>{lottery.lotteryName}</option>)}</select></label>{selected && <div className="draw-summary"><div><span>Draw date</span><strong>{dateText(selected.drawDate)}</strong></div><div><span>Draw time</span><strong>{timeText(selected.drawDate)}</strong></div><div><span>Status</span><strong>{selected.drawStatus || "SCHEDULED"}</strong></div></div>}{selected && <form onSubmit={saveResults}><div className="winner-table"><div className="winner-table-head"><span>Bet Type</span><span>Winning Number</span><span>Prize Amount</span></div>{rows.map((row, index) => <div className="winner-table-row" key={row.betType}><strong>{labels[row.betType]}</strong><input aria-label={`${labels[row.betType]} winning number`} inputMode="numeric" maxLength={row.betType === "SINGLE" ? 1 : row.betType === "DOUBLE" ? 2 : 3} value={row.winningNumber} disabled={locked} onChange={(event) => updateRow(index, "winningNumber", event.target.value.replace(/\D/g, ""))} /><input aria-label={`${labels[row.betType]} prize amount`} type="number" min="0.01" step="0.01" value={row.prizeAmount} disabled={locked} onChange={(event) => updateRow(index, "prizeAmount", event.target.value)} placeholder={money(0)} /></div>)}</div>{selected && new Date(selected.drawDate).getTime() > Date.now() && <p className="form-note">Winning result submission is locked until after the server draw time.</p>}<div className="form-actions"><button className="secondary-button" disabled={busy || locked}>Save / Update</button><button type="button" className="primary-button" disabled={busy || locked} onClick={declareResults}>{busy ? "Processing..." : "Confirm & Declare"}</button></div></form>}</section>}</>;
}