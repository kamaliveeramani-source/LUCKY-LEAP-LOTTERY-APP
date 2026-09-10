import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ContentManager.css";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";
const apiBaseUrl = configuredApiUrl.replace(/\/$/, "").endsWith("/api") ? configuredApiUrl : `${configuredApiUrl.replace(/\/$/, "")}/api`;
const API = axios.create({ baseURL: apiBaseUrl });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const configs = {
  games: { title: "Games", endpoint: "/admin/games", fields: ["name", "slug", "category", "gameType", "description", "configuration", "displayOrder"], required: ["name", "category", "gameType"] },
  promotions: { title: "Promotions", endpoint: "/admin/promotions", fields: ["title", "type", "description", "startDate", "endDate", "displayOrder"], required: ["title", "type", "startDate", "endDate"] },
  offers: { title: "Offers", endpoint: "/admin/offers", fields: ["title", "type", "description", "rewardText", "startDate", "endDate", "displayOrder"], required: ["title", "type", "startDate", "endDate"] },
};

const gameTypes = ["GREEN_YELLOW_RED", "CRICKET", "GOLDEN_SPIN", "RUMMY", "POKER", "ABC_DIGIT"];
const defaultGameConfiguration = (type) => {
  if (type === "GREEN_YELLOW_RED") return { numbers: Array.from({ length: 10 }, (_, number) => ({ number, color: ["GREEN", "YELLOW", "RED"][number % 3] })) };
  if (type === "ABC_DIGIT") return { divisions: ["A", "B", "C"] };
  if (type === "CRICKET") return { categories: ["INTERNATIONAL", "T20", "IPL"] };
  if (type === "RUMMY") return { minAmount: 50, maxAmount: 5000 };
  if (type === "GOLDEN_SPIN") return { numbers: Array.from({ length: 10 }, (_, number) => number) };
  if (type === "POKER") return { gameMode: "POKER" };
  return {};
};
const parseConfiguration = (value, type) => { try { return { ...defaultGameConfiguration(type), ...(value ? JSON.parse(value) : {}) }; } catch { return defaultGameConfiguration(type); } };

function GameConfigurationFields({ gameType, value, onChange }) {
  const configuration = parseConfiguration(value, gameType);
  const setConfiguration = (next) => onChange(JSON.stringify(next, null, 2));
  if (!gameType) return <div className="game-config-note">Choose a game type to configure its Phase 1 options.</div>;
  if (gameType === "GREEN_YELLOW_RED") return <div className="game-config-panel"><strong>Number colors</strong><div className="game-config-grid game-number-grid"><span>Number</span><span>Color</span>{configuration.numbers.map((item, index) => <div className="game-number-row" key={item.number}><span>{item.number}</span><select value={item.color} onChange={(event) => { const numbers = configuration.numbers.map((entry, entryIndex) => entryIndex === index ? { ...entry, color: event.target.value } : entry); setConfiguration({ ...configuration, numbers }); }}><option>GREEN</option><option>YELLOW</option><option>RED</option></select></div>)}</div></div>;
  if (gameType === "ABC_DIGIT") return <div className="game-config-panel"><strong>ABC divisions</strong><div className="game-choice-row">{["A", "B", "C"].map((division) => <label key={division}><input type="checkbox" checked={configuration.divisions.includes(division)} onChange={(event) => setConfiguration({ ...configuration, divisions: event.target.checked ? [...configuration.divisions, division] : configuration.divisions.filter((item) => item !== division) })} />{division}</label>)}</div></div>;
  if (gameType === "CRICKET") return <div className="game-config-panel"><strong>Cricket categories</strong><div className="game-choice-row">{[["INTERNATIONAL", "International Cricket"], ["T20", "T20"], ["IPL", "IPL"]].map(([valueKey, label]) => <label key={valueKey}><input type="checkbox" checked={configuration.categories.includes(valueKey)} onChange={(event) => setConfiguration({ ...configuration, categories: event.target.checked ? [...configuration.categories, valueKey] : configuration.categories.filter((item) => item !== valueKey) })} />{label}</label>)}</div></div>;
  if (gameType === "RUMMY") return <div className="game-config-panel"><strong>Rummy amount range</strong><div className="game-config-grid"><div><label htmlFor="rummy-min">Minimum amount</label><input id="rummy-min" type="number" min="50" value={configuration.minAmount} onChange={(event) => setConfiguration({ ...configuration, minAmount: Number(event.target.value) })} /></div><div><label htmlFor="rummy-max">Maximum amount</label><input id="rummy-max" type="number" max="5000" value={configuration.maxAmount} onChange={(event) => setConfiguration({ ...configuration, maxAmount: Number(event.target.value) })} /></div></div></div>;
  if (gameType === "GOLDEN_SPIN") return <div className="game-config-panel"><strong>Golden Spin numbers</strong><div className="game-choice-row">{Array.from({ length: 10 }, (_, number) => <label key={number}><input type="checkbox" checked={configuration.numbers.includes(number)} onChange={(event) => setConfiguration({ ...configuration, numbers: event.target.checked ? [...configuration.numbers, number].sort((a, b) => a - b) : configuration.numbers.filter((item) => item !== number) })} />{number}</label>)}</div></div>;
  return <div className="game-config-panel"><strong>Poker configuration</strong><p>Configure the available Poker options.</p></div>;
}

function initialForm(config) { return Object.fromEntries(config.fields.map((field) => [field, ""])); }
function inputValue(item, field) { if (!item) return ""; if (field === "startDate" || field === "endDate") return item[field] ? new Date(item[field]).toISOString().slice(0, 16) : ""; if (field === "configuration") return JSON.stringify(item[field] || {}, null, 2); return item[field] ?? ""; }

export default function ContentManager({ kind }) {
  const config = configs[kind];
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", featured: "", type: "", category: "", date: "" });
  const [form, setForm] = useState(initialForm(config));
  const [image, setImage] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [state, setState] = useState({ loading: true, saving: false, error: "", notice: "" });

  async function load() {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const response = await API.get(config.endpoint);
      setItems(response.data?.data || []);
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to load content." }));
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }
  useEffect(() => { load(); }, [kind]);

  const visibleItems = useMemo(() => items.filter((item) => {
    const search = filters.search.toLowerCase();
    const searchable = `${item.name || item.title || ""} ${item.description || ""}`.toLowerCase();
    const selectedDate = filters.date ? new Date(`${filters.date}T00:00:00`) : null;
    const startsBeforeDate = !selectedDate || !item.startDate || new Date(item.startDate) <= new Date(`${filters.date}T23:59:59`);
    const endsAfterDate = !selectedDate || !item.endDate || new Date(item.endDate) >= selectedDate;
    return (!search || searchable.includes(search)) && (!filters.status || item.status === filters.status) && (!filters.featured || String(item.featured) === filters.featured) && (!filters.type || item.type === filters.type) && (!filters.category || item.category === filters.category) && startsBeforeDate && endsAfterDate;
  }), [items, filters]);

  function openCreate() { setEditing(null); setEditorOpen(true); setFeatured(false); setForm(initialForm(config)); setImage(null); setState((current) => ({ ...current, notice: "", error: "" })); }
  function openEdit(item) { setEditing(item); setEditorOpen(true); setFeatured(Boolean(item.featured)); setForm(Object.fromEntries(config.fields.map((field) => [field, inputValue(item, field)]))); setImage(null); setState((current) => ({ ...current, notice: "", error: "" })); }
  function change(field, value) { setForm((current) => ({ ...current, [field]: value, ...(field === "gameType" && kind === "games" ? { configuration: JSON.stringify(defaultGameConfiguration(value), null, 2) } : {}) })); }
  function renderField(field) {
    const label = field.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase());
    if (field === "configuration") return <label key={field}>{label}<textarea rows="7" value={form[field]} onChange={(event) => change(field, event.target.value)} /></label>;
    if (field === "gameType" && kind === "games") return <label key={field}>{label}<select required value={form[field]} onChange={(event) => change(field, event.target.value)}><option value="">Choose game type</option>{gameTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>;
    return <label key={field}>{label}<input required={config.required.includes(field)} type={field.includes("Date") ? "datetime-local" : field === "displayOrder" ? "number" : "text"} value={form[field]} onChange={(event) => change(field, event.target.value)} /></label>;
  }

  async function save(event) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", notice: "" }));
    try {
      const payload = Object.fromEntries(config.fields.map((field) => [field, field === "configuration" && kind === "games" ? parseConfiguration(form[field], form.gameType) : form[field]]));
      payload.status = editing?.status || "ACTIVE";
      payload.featured = featured;
      const data = image ? new FormData() : payload;
      if (image) {
        Object.entries(payload).forEach(([field, value]) => data.append(field, typeof value === "object" ? JSON.stringify(value) : value));
        data.append("image", image);
      }
      const response = editing ? await API.put(`${config.endpoint}/${editing.id}`, data) : await API.post(config.endpoint, data);
      setItems((current) => editing ? current.map((item) => item.id === editing.id ? response.data.data : item) : [response.data.data, ...current]);
      setState((current) => ({ ...current, notice: `${config.title.slice(0, -1)} saved successfully.` }));
      setEditing(null); setEditorOpen(false); setForm(initialForm(config)); setImage(null);
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to save content." }));
    } finally { setState((current) => ({ ...current, saving: false })); }
  }

  async function toggle(item) {
    try {
      const status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await API.patch(`${config.endpoint}/${item.id}/status`, { status });
      setItems((current) => current.map((entry) => entry.id === item.id ? response.data.data : entry));
    } catch (error) { setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to update status." })); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name || item.title}? This cannot be undone.`)) return;
    try { await API.delete(`${config.endpoint}/${item.id}`); setItems((current) => current.filter((entry) => entry.id !== item.id)); setState((current) => ({ ...current, notice: "Content deleted." })); }
    catch (error) { setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to delete content." })); }
  }

  return <>
    <div className="page-header"><div><span className="eyebrow">Content management</span><h1>{config.title}</h1><p>Manage customer-facing {config.title.toLowerCase()} from the Admin Panel.</p></div><button className="primary-button" onClick={openCreate}>＋ Add {config.title.slice(0, -1)}</button></div>
    {state.notice && <div className="toast">{state.notice}</div>}
    {state.error && <div className="error-box">{state.error}</div>}
    <section className="content-toolbar"><input placeholder="Search..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>{kind === "games" ? <input placeholder="Category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} /> : <input placeholder="Type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} />} {kind !== "games" && <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />}<select value={filters.featured} onChange={(event) => setFilters({ ...filters, featured: event.target.value })}><option value="">All featured</option><option value="true">Featured</option><option value="false">Not featured</option></select></section>
    {state.loading ? <div className="loading-state"><span className="spinner" />Loading data...</div> : <section className="content-grid">{visibleItems.map((item) => <article className="content-card" key={item.id}>{item.image ? <img src={item.image} alt="" className="content-image" /> : <div className="content-image content-image-empty">No image</div>}<div className="content-card-body"><div className="content-card-heading"><div><h2>{item.name || item.title}</h2><span>{item.category || item.type}{item.gameType ? ` · ${item.gameType}` : ""}</span></div><span className={`status-badge ${item.status === "ACTIVE" ? "success" : "muted"}`}><span />{item.status}</span></div><p>{item.description || item.rewardText || "No description"}</p><div className="content-meta"><span>Order {item.displayOrder}</span><span>{item.featured ? "Featured" : "Standard"}</span>{item.rewardText && <span>{item.rewardText}</span>}{item.startDate && <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>}</div><div className="content-actions"><button className="secondary-button small-button" onClick={() => openEdit(item)}>Edit</button><button className="secondary-button small-button" onClick={() => toggle(item)}>{item.status === "ACTIVE" ? "Disable" : "Enable"}</button><button className="danger-button small-button" onClick={() => remove(item)}>Delete</button></div></div></article>)}{visibleItems.length === 0 && <div className="empty-state"><strong>No {config.title.toLowerCase()} found.</strong><span>Create your first item or adjust the filters.</span></div>}</section>}
    {editorOpen && <div className="modal-backdrop"><section className="modal content-modal"><div className="modal-head"><div><span className="eyebrow">{editing ? "Edit" : "New"}</span><h2>{editing ? (editing.name || editing.title) : `Add ${config.title.slice(0, -1)}`}</h2></div><button className="close-button" onClick={() => { setEditing(null); setEditorOpen(false); setForm(initialForm(config)); }}>×</button></div><form className="form-grid content-form" onSubmit={save}>{config.fields.map(renderField)}{kind === "games" && <GameConfigurationFields gameType={form.gameType} value={form.configuration} onChange={(value) => change("configuration", value)} />}<label>Image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label>{editing?.image && <img src={editing.image} alt="Current" className="content-form-preview" />}<label className="content-check"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured</label><div className="form-actions span-2"><button type="button" className="secondary-button" onClick={() => { setEditing(null); setEditorOpen(false); setForm(initialForm(config)); }}>Cancel</button><button className="primary-button" disabled={state.saving}>{state.saving ? "Saving..." : "Save"}</button></div></form></section></div>}
  </>;
}
