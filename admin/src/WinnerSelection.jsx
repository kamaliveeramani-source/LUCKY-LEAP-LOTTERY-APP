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
const AMOUNT_KEY = { SINGLE: "singleDigitWinningAmount", DOUBLE: "doubleDigitWinningAmount", TRIPLE: "tripleDigitWinningAmount" };
const STATUS_LABELS = { UPCOMING: "Upcoming", READY_FOR_RESULT: "Ready for Result", COMPLETED: "Completed" };
const STATUS_BADGE_CLASS = { UPCOMING: "upcoming", READY_FOR_RESULT: "ready", COMPLETED: "success" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const IST_FORMAT = { timeZone: "Asia/Kolkata" };
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-IN", { ...IST_FORMAT, day: "2-digit", month: "short", year: "numeric" }) : "-";
const timeText = (value) => value ? new Date(value).toLocaleTimeString("en-IN", { ...IST_FORMAT, hour: "2-digit", minute: "2-digit", hour12: true }) : "-";

function emptyRows() { return BET_TYPES.map((betType) => ({ betType, winningNumber: "", prizeAmount: "" })); }

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function WinnerSelection() {
  const [lotteries, setLotteries] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [rows, setRows] = useState(emptyRows());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [reportType, setReportType] = useState("winners");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [entryAmounts, setEntryAmounts] = useState(null);
  const selected = lotteries.find((item) => String(item.id) === String(selectedId));
  const status = selected?.drawStatus || "UPCOMING";
  const completed = status === "COMPLETED";
  const locked = !selected || status !== "READY_FOR_RESULT";

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
      const [resultsResponse, amountsResponse] = await Promise.all([
        API.get(`/admin/lotteries/${id}/winning-results`),
        API.get("/admin/lottery-entry-amounts"),
      ]);
      const configured = resultsResponse.data?.data?.results || [];
      const amounts = amountsResponse.data?.data || null;
      setEntryAmounts(amounts);
      // Prize amount always comes from the database: saved result if declared/configured, otherwise the live configured WINNING amount for that bet type (never the ticket/entry amount).
      setRows(BET_TYPES.map((betType) => {
        const result = configured.find((item) => item.betType === betType);
        const configuredAmount = amounts ? amounts[AMOUNT_KEY[betType]] : "";
        return { betType, winningNumber: result?.winningNumber || "", prizeAmount: result?.prizeAmount ?? configuredAmount ?? "" };
      }));
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load winning results."); }
  }

  useEffect(() => { loadLotteries(); }, []);
  useEffect(() => { loadResults(selectedId); }, [selectedId]);

  async function loadReport(id, type) {
    if (!id) return;
    try {
      setReportLoading(true); setError("");
      const response = await API.get(`/admin/lotteries/${id}/report`, { params: { type } });
      setReport(response.data?.data || null);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load report."); }
    finally { setReportLoading(false); }
  }

  useEffect(() => { if (completed) loadReport(selectedId, reportType); else setReport(null); }, [selectedId, reportType, completed]);

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      const response = await API.get("/admin/results/history");
      setHistory(response.data?.data || []);
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load result history."); }
    finally { setHistoryLoading(false); }
  }

  useEffect(() => { loadHistory(); }, []);

  async function exportReport(type) {
    if (!selected) return;
    setExporting(true); setError("");
    try {
      const response = await API.get(`/admin/lotteries/${selected.id}/report/export`, { params: { type }, responseType: "blob" });
      const drawDateText = selected.drawDate ? new Date(selected.drawDate).toISOString().slice(0, 10) : "unknown";
      const safeName = String(selected.lotteryName || "Lottery").replace(/[^a-zA-Z0-9]+/g, "");
      downloadBlob(response.data, `LuckyHorse_${safeName}_${drawDateText}_${type === "winners" ? "Winners" : "AllTickets"}.xlsx`);
    } catch (requestError) { setError("Unable to export report."); }
    finally { setExporting(false); }
  }
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

  return <><div className="page-header"><div><span className="eyebrow">Payouts</span><h1>Winner Selection</h1><p>Configure the winning number and prize for each applicable bet type.</p></div><button className="secondary-button" onClick={loadLotteries}>↻ Refresh</button></div>{notice && <div className="toast">{notice}</div>}{error && <div className="error-box">{error}</div>}{loading ? <div className="loading-state">Loading draws...</div> : <section className="panel winner-selection"><label>Lottery<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{lotteries.map((lottery) => <option key={lottery.id} value={lottery.id}>{lottery.lotteryName}</option>)}</select></label>{selected && <div className="draw-summary"><div><span>Draw date</span><strong>{dateText(selected.drawDate)}</strong></div><div><span>Draw time</span><strong>{timeText(selected.drawDate)}</strong></div><div><span>Status</span><strong><span className={`status-badge ${STATUS_BADGE_CLASS[status] || "upcoming"}`}><span />{STATUS_LABELS[status] || status}</span></strong></div></div>}{selected && <form onSubmit={saveResults}><div className="winner-table"><div className="winner-table-head"><span>Bet Type</span><span>Winning Number</span><span>Prize Amount</span></div>{rows.map((row, index) => <div className="winner-table-row" key={row.betType}><strong>{labels[row.betType]}</strong><input aria-label={`${labels[row.betType]} winning number`} inputMode="numeric" maxLength={row.betType === "SINGLE" ? 1 : row.betType === "DOUBLE" ? 2 : 3} value={row.winningNumber} disabled={locked} onChange={(event) => updateRow(index, "winningNumber", event.target.value.replace(/\D/g, ""))} /><input aria-label={`${labels[row.betType]} prize amount`} type="number" min="0.01" step="0.01" value={row.prizeAmount} disabled={locked} onChange={(event) => updateRow(index, "prizeAmount", event.target.value)} placeholder={money(0)} /></div>)}</div>{status === "UPCOMING" && <p className="form-note">Winning number fields are locked until after the draw time.</p>}{status === "COMPLETED" && <p className="form-note">This draw has already been declared and settled.</p>}<div className="form-actions"><button className="secondary-button" disabled={busy || locked}>Save / Update</button><button type="button" className="primary-button" disabled={busy || locked} onClick={declareResults}>{busy ? "Processing..." : "Confirm & Declare"}</button></div></form>}</section>}

    {selected && completed && <section className="panel winner-report">
      <div className="panel-title"><div><span className="eyebrow">Report</span><h2>{selected.lotteryName} draw report</h2></div>
        <div className="row-actions">
          <button className={`secondary-button ${reportType === "winners" ? "active" : ""}`} onClick={() => setReportType("winners")}>Winners</button>
          <button className={`secondary-button ${reportType === "all" ? "active" : ""}`} onClick={() => setReportType("all")}>All Tickets</button>
        </div>
      </div>
      <div className="row-actions" style={{ marginBottom: 16 }}>
        <button className="primary-button" disabled={exporting} onClick={() => exportReport("winners")}>{exporting ? "Preparing..." : "Download Winners Excel"}</button>
        <button className="secondary-button" disabled={exporting} onClick={() => exportReport("all")}>{exporting ? "Preparing..." : "Download All Tickets Excel"}</button>
      </div>
      {reportLoading ? <div className="loading-state">Loading report...</div> : !report || report.rows.length === 0 ? <Empty text="No matching tickets for this draw yet." /> : <>
        <div className="draw-summary">
          <div><span>Tickets</span><strong>{report.summary.count}</strong></div>
          <div><span>Winners</span><strong>{report.summary.winners}</strong></div>
          <div><span>Total prize paid</span><strong>{money(report.summary.totalPrizeAmount)}</strong></div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Customer</th><th>Mobile</th><th>Ticket No</th><th>Number</th><th>Bet Type</th><th>Ticket Amount</th><th>Winning Amount</th><th>Payment ID</th><th>Status</th></tr></thead>
            <tbody>
              {report.rows.map((row) => <tr key={row.ticketId}>
                <td>{row.customerName}</td>
                <td>{row.mobile}</td>
                <td>{row.ticketNumber}</td>
                <td>{row.purchasedNumber}</td>
                <td>{row.betType}</td>
                <td>{money(row.ticketAmount)}</td>
                <td>{money(row.winningAmount)}</td>
                <td>{row.paymentId}</td>
                <td><StatusBadge active={row.winStatus === "WON"} label={row.winStatus} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </>}
    </section>}

    <section className="panel result-history">
      <div className="panel-title"><div><span className="eyebrow">History</span><h2>Result History</h2></div><button className="secondary-button" onClick={loadHistory}>↻ Refresh</button></div>
      {historyLoading ? <div className="loading-state">Loading result history...</div> : history.length === 0 ? <Empty text="No declared draws yet." /> : <div className="table-wrap">
        <table>
          <thead><tr><th>Lottery</th><th>Draw Date</th><th>Winners</th><th>Total Prize</th><th>Declared</th><th>Declared By</th></tr></thead>
          <tbody>
            {history.map((item) => <tr key={item.id}>
              <td>{item.lotteryName}</td>
              <td>{dateText(item.drawDate)} {timeText(item.drawDate)}</td>
              <td>{item.numberOfWinners}</td>
              <td>{money(item.totalPrizeAmount)}</td>
              <td>{dateText(item.declaredAt)} {timeText(item.declaredAt)}</td>
              <td>{item.declaredBy || "-"}</td>
            </tr>)}
          </tbody>
        </table>
      </div>}
    </section>
  </>;
}

function StatusBadge({ active = true, label }) { return <span className={`status-badge ${active ? "success" : "muted"}`}><span />{label}</span>; }

function Empty({ text = "No records found." }) { return <div className="empty-state"><strong>{text}</strong><span>New activity will appear here when it is available.</span></div>; }
