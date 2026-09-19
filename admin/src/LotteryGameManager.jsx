import { useEffect, useState } from "react";
import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";
const apiBaseUrl = configuredApiUrl.replace(/\/$/, "").endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl.replace(/\/$/, "")}/api`;
const API = axios.create({ baseURL: apiBaseUrl });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyForm = { name: "", ticketPrice: "", mainWinning: "", bcWinning: "", cWinning: "" };
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
    setState((current) => ({ ...current, error: "", notice: "" }));
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name || "", ticketPrice: item.ticketPrice || "", mainWinning: item.mainWinning || "", bcWinning: item.bcWinning || "", cWinning: item.cWinning || "" });
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

  return <>
    <PageHeader title="Kerala Lottery Games" description="Manage ticket prices and prize values shown to customers." action={<button className="primary-button" onClick={openCreate}>＋ Add lottery game</button>} />
    {state.notice && <div className="toast">{state.notice}</div>}
    {state.error && <div className="error-box">{state.error}</div>}
    {state.loading ? <div className="loading-state"><span className="spinner" />Loading data...</div> : <section className="panel">
      <div className="table-wrap"><table><thead><tr><th>Game name</th><th>Ticket price</th><th>Winning</th><th>BC</th><th>C</th><th>Status</th><th /></tr></thead><tbody>
        {items.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{money(item.ticketPrice)}</td><td>{money(item.mainWinning)}</td><td>{item.bcWinning ? money(item.bcWinning) : "-"}</td><td>{item.cWinning ? money(item.cWinning) : "-"}</td><td><span className={`status-badge ${item.isActive ? "success" : "muted"}`}><span />{item.isActive ? "Active" : "Inactive"}</span></td><td><div className="content-actions"><button className="secondary-button small-button" onClick={() => openEdit(item)}>Edit</button><button className="secondary-button small-button" onClick={() => toggle(item)}>{item.isActive ? "Disable" : "Activate"}</button></div></td></tr>)}
      </tbody></table></div>
      {!items.length && <div className="empty-state"><strong>No lottery games configured.</strong><span>Add the first Kerala lottery game.</span></div>}
    </section>}
    {modalOpen && <div className="modal-backdrop"><section className="modal content-modal"><div className="modal-head"><div><span className="eyebrow">{editing ? "Edit" : "New"}</span><h2>{editing ? "Edit lottery game" : "Add lottery game"}</h2></div><button className="close-button" onClick={() => setModalOpen(false)}>×</button></div><form className="form-grid content-form" onSubmit={save}><label className="span-2">Game name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Ticket price<input required min="0.01" step="0.01" type="number" value={form.ticketPrice} onChange={(event) => setForm({ ...form, ticketPrice: event.target.value })} /></label><label>Main winning<input required min="0.01" step="0.01" type="number" value={form.mainWinning} onChange={(event) => setForm({ ...form, mainWinning: event.target.value })} /></label><label>BC winning <small>Optional</small><input min="0.01" step="0.01" type="number" value={form.bcWinning} onChange={(event) => setForm({ ...form, bcWinning: event.target.value })} /></label><label>C winning <small>Optional</small><input min="0.01" step="0.01" type="number" value={form.cWinning} onChange={(event) => setForm({ ...form, cWinning: event.target.value })} /></label><div className="form-actions span-2"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" disabled={state.saving}>{state.saving ? "Saving..." : editing ? "Update" : "Save"}</button></div></form></section></div>}
  </>;
}

function PageHeader({ title, description, action }) {
  return <div className="page-header"><div><span className="eyebrow">Lottery management</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
