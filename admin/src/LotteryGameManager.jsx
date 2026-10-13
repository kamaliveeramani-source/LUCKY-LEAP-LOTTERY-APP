import { useEffect, useState } from "react";
import axios from "axios";
import PageHeader from "./components/PageHeader";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";
const normalizedApi = configuredApiUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedApi.endsWith("/api")
  ? normalizedApi
  : `${normalizedApi}/api`;
const API = axios.create({ baseURL: apiBaseUrl });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyForm = { name: "", subtitle: "", icon: "", buttonTheme: "purple", displayOrder: "", ticketPrice: "", mainWinning: "", bcWinning: "", cWinning: "" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const getData = (response) => response.data?.data || [];

function validate(form) {
  if (!form.name.trim()) return "Game name is required.";
  for (const [key, label, required] of [["ticketPrice", "Ticket price", true], ["mainWinning", "Main winning", true], ["bcWinning", "BC winning", false], ["cWinning", "C winning", false]]) {
    if (!form[key] && required) return `${label} is required.`;
    if (form[key] && (!Number.isFinite(Number(form[key])) || Number(form[key]) <= 0)) return `${label} must be greater than 0.`;
  }
  return "";
}

export default function LotteryGameManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, saving: false, error: "", notice: "" });

  async function load() {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      setItems(getData(await API.get("/admin/lottery-games")));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to load lottery games." }));
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }

  useEffect(() => { load(); }, []);

  const visibleItems = items.filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()));
  const totalGames = items.length;
  const activeGames = items.filter((item) => item.isActive).length;
  const inactiveGames = totalGames - activeGames;
  const avgTicketPrice = totalGames ? items.reduce((sum, item) => sum + (Number(item.ticketPrice) || 0), 0) / totalGames : 0;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
    setState((current) => ({ ...current, error: "", notice: "" }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name || "", subtitle: item.subtitle || "", icon: item.icon || "", buttonTheme: item.buttonTheme || "purple", displayOrder: item.displayOrder ?? "", ticketPrice: item.ticketPrice || "", mainWinning: item.mainWinning || "", bcWinning: item.bcWinning || "", cWinning: item.cWinning || "" });
    setModalOpen(true);
    setState((current) => ({ ...current, error: "", notice: "" }));
  }

  async function save(event) {
    event.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setState((current) => ({ ...current, error: validationError }));
      return;
    }
    setState((current) => ({ ...current, saving: true, error: "" }));
    const payload = {
      name: form.name.trim(),
      ticketPrice: Number(form.ticketPrice),
      mainWinning: Number(form.mainWinning),
      bcWinning: form.bcWinning ? Number(form.bcWinning) : null,
      cWinning: form.cWinning ? Number(form.cWinning) : null,
      displayOrder: Number(form.displayOrder || 0),
    };
    try {
      const response = editing
        ? await API.put(`/admin/lottery-games/${editing.id}`, payload)
        : await API.post("/admin/lottery-games", payload);
      setItems((current) => editing ? current.map((item) => item.id === editing.id ? response.data.data : item) : [...current, response.data.data]);
      setModalOpen(false);
      setEditing(null);
      setState((current) => ({ ...current, notice: "Lottery game saved successfully." }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to save lottery game." }));
    } finally {
      setState((current) => ({ ...current, saving: false }));
    }
  }

  async function toggle(item) {
    try {
      const response = await API.patch(`/admin/lottery-games/${item.id}/status`, { isActive: !item.isActive });
      setItems((current) => current.map((entry) => entry.id === item.id ? response.data.data : entry));
      setState((current) => ({ ...current, notice: `Game ${item.isActive ? "disabled" : "activated"}.` }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to update game status." }));
    }
  }

  return (
    <>
      <PageHeader
        crumb="Lottery / Lottery Betting"
        title="Kerala Lottery Games"
        description="Manage ticket prices and prize values shown to customers."
        action={<button className="primary-button" onClick={openCreate}>＋ Add Lottery Game</button>}
      />
      {state.notice && <div className="toast">{state.notice}</div>}
      {state.error && <div className="error-box">{state.error}</div>}
      {state.loading ? (
        <div className="loading-state"><span className="spinner" />Loading data...</div>
      ) : (
        <>
          <div className="dashboard-stat-grid lottery-grid">
            <article className="metric-card purple-card">
              <div className="metric-icon">🎮</div>
              <div className="metric-copy">
                <span>Total Games</span>
                <strong>{totalGames}</strong>
                <small>Active lottery games</small>
              </div>
            </article>
            <article className="metric-card green-card">
              <div className="metric-icon">✓</div>
              <div className="metric-copy">
                <span>Active Games</span>
                <strong>{activeGames}</strong>
                <small>Currently active</small>
              </div>
            </article>
            <article className="metric-card amber-card">
              <div className="metric-icon">◌</div>
              <div className="metric-copy">
                <span>Inactive Games</span>
                <strong>{inactiveGames}</strong>
                <small>Currently inactive</small>
              </div>
            </article>
            <article className="metric-card blue-card">
              <div className="metric-icon">₹</div>
              <div className="metric-copy">
                <span>Avg. Ticket Price</span>
                <strong>{money(avgTicketPrice)}</strong>
                <small>Across all games</small>
              </div>
            </article>
          </div>

          <section className="panel game-table-panel">
            <div className="panel-header">
              <div>
                <h2>Lottery Games</h2>
                <p>Manage ticket prices, winning amounts and prize values</p>
              </div>
              <div className="toolbar-actions">
                <div className="header-search">
                  <span>⌕</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games..." aria-label="Search lottery games" />
                </div>
                <button className="secondary-button" type="button">Filter ▾</button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="lottery-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Game Name</th>
                    <th>Icon / Theme</th>
                    <th>Ticket Price</th>
                    <th>Winning Amount</th>
                    <th>BC Amount</th>
                    <th>C Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item, index) => (
                    <tr key={item.id}>
                      <td><span className="game-index">{index + 1}</span></td>
                      <td>
                        <div className="game-name-cell">
                          <strong>{item.name}</strong>
                          <span className="game-tag">{item.subtitle || "Game"}</span>
                        </div>
                      </td>
                      <td><span className={`admin-lottery-theme-dot ${item.buttonTheme || "purple"}`} />{item.icon || "-"}<small>Order {item.displayOrder ?? item.id}</small></td>
                      <td>{money(item.ticketPrice)}</td>
                      <td>{money(item.mainWinning)}</td>
                      <td>{item.bcWinning ? money(item.bcWinning) : "-"}</td>
                      <td>{item.cWinning ? money(item.cWinning) : "-"}</td>
                      <td>
                        <span className={`status-badge ${item.isActive ? "success" : "muted"}`}>
                          <span />{item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="secondary-button small-button" onClick={() => openEdit(item)}>Edit</button>
                          <button className="danger-button small-button" onClick={() => toggle(item)}>{item.isActive ? "Disable" : "Activate"}</button>
                          <button className="icon-button" type="button" aria-label="More actions">⋮</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing {visibleItems.length ? 1 : 0} to {visibleItems.length} of {totalGames} games</span>
              <div className="pagination-controls">
                <button type="button" className="secondary-button small-button" disabled>‹</button>
                <span className="page-pill">1</span>
                <button type="button" className="secondary-button small-button">›</button>
              </div>
            </div>
          </section>
        </>
      )}

      {modalOpen && (
        <div className="modal-backdrop">
          <section className="modal content-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">{editing ? "Edit" : "New"}</span>
                <h2>{editing ? "Edit lottery game" : "Add lottery game"}</h2>
              </div>
              <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form className="form-grid content-form" onSubmit={save}>
              <label className="span-2">Game name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Subtitle<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="e.g. Single Digit" /></label>
              <label>Card icon label<input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="e.g. ABC, 1/2, 3D" /></label>
              <label>Button theme<select value={form.buttonTheme} onChange={(event) => setForm({ ...form, buttonTheme: event.target.value })}><option value="purple">Purple</option><option value="orange">Orange</option><option value="green">Green</option><option value="blue">Blue</option><option value="pink">Pink</option></select></label>
              <label>Display order<input min="0" step="1" type="number" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} /></label>
              <label>Ticket price<input required min="0.01" step="0.01" type="number" value={form.ticketPrice} onChange={(event) => setForm({ ...form, ticketPrice: event.target.value })} /></label>
              <label>Main winning<input required min="0.01" step="0.01" type="number" value={form.mainWinning} onChange={(event) => setForm({ ...form, mainWinning: event.target.value })} /></label>
              <label>BC winning <small>Optional</small><input min="0.01" step="0.01" type="number" value={form.bcWinning} onChange={(event) => setForm({ ...form, bcWinning: event.target.value })} /></label>
              <label>C winning <small>Optional</small><input min="0.01" step="0.01" type="number" value={form.cWinning} onChange={(event) => setForm({ ...form, cWinning: event.target.value })} /></label>
              <div className="form-actions span-2">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="primary-button" disabled={state.saving}>{state.saving ? "Saving..." : editing ? "Update" : "Save"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
