import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import thumbiLogo from "../../frontend/src/assets/thumbi-logo.png";
import lotteryArtwork from "../../frontend/src/assets/lotteries/lottery.png";
import lotteryBanner from "./upcoming-draw-sunset.svg";
import keralaArtwork from "../../frontend/src/assets/lotteries/kerala-emblem-transparent.png";
import bhagyatharaArtwork from "../../frontend/src/assets/lotteries/bhagyathara-transparent.png";
import karunyaArtwork from "../../frontend/src/assets/lotteries/karunya-transparent.png";
import karunyaPlusArtwork from "../../frontend/src/assets/lotteries/karunya-plus-transparent.png";
import nagalandDayArtwork from "../../frontend/src/assets/lotteries/nagaland-day-transparent.png";
import nagalandEveningArtwork from "../../frontend/src/assets/lotteries/nagaland-evening-transparent.png";
import nagalandMorningArtwork from "../../frontend/src/assets/lotteries/nagaland-morning-transparent.png";
import samrudhiArtwork from "../../frontend/src/assets/lotteries/samrudhi-transparent.png";
import sthreesakthiArtwork from "../../frontend/src/assets/lotteries/sthree-sakthi-transparent.png";
import suvarnaKeralamArtwork from "../../frontend/src/assets/lotteries/suvarna-keralam-transparent.png";
import winWinArtwork from "../../frontend/src/assets/lotteries/win-win-transparent.png";
import "./styles.css";
import ContentManager from "./ContentManager";
import WinnerSelection from "./WinnerSelection";
import LotteryGameManager from "./LotteryGameManager";
import PageHeader from "./components/PageHeader";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";
const apiBaseUrl = configuredApiUrl.replace(/\/$/, "").endsWith("/api")
  ? configuredApiUrl
  : `${configuredApiUrl.replace(/\/$/, "")}/api`;
const API = axios.create({ baseURL: apiBaseUrl });
API.interceptors.request.use((config) => {
  if (config.url?.includes("/auth/login")) return config;
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminName");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

const navItems = [
  ["Dashboard", "/dashboard", "▦"],
  ["Lotteries", "/lotteries", "◉"],
  ["Lottery Amounts", "/lottery-entry-amounts", "₹"],
  ["Lottery Betting", "/lottery-games", "◇"],
  ["Games", "/games", "◆"],
  ["Promotions", "/promotions", "✦"],
  ["Offers", "/offers", "◇"],
  ["Tickets", "/tickets", "▤"],
  ["Users", "/users", "♙"],
  ["Winners", "/winners", "★"],
  ["Transactions", "/transactions", "↔"],
  ["Reports", "/reports", "◒"],
  ["Notifications", "/notifications", "♢"],
  ["Activity", "/activity", "◷"],
];

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const IST_FORMAT = { timeZone: "Asia/Kolkata" };
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-IN", { ...IST_FORMAT, day: "2-digit", month: "short", year: "numeric" }) : "-";
const timeText = (value) => value ? new Date(value).toLocaleTimeString("en-IN", { ...IST_FORMAT, hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
const lotteryTimeText = (value) => value ? new Date(value).toLocaleTimeString("en-IN", { ...IST_FORMAT, hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase() : "-";
const istInputParts = (value) => new Intl.DateTimeFormat("en-CA", { ...IST_FORMAT, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value)).reduce((parts, item) => ({ ...parts, [item.type]: item.value }), {});
const istInputDate = (value) => { const parts = istInputParts(value); return `${parts.year}-${parts.month}-${parts.day}`; };
const istInputTime = (value) => { const parts = istInputParts(value); return `${parts.hour}:${parts.minute}`; };
const istDateKey = (value) => value ? new Intl.DateTimeFormat("en-CA", { ...IST_FORMAT, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)) : "";
function relativeDrawLabel(value, now = Date.now()) {
  const targetKey = istDateKey(value);
  if (!targetKey) return "No upcoming draw";
  const todayKey = istDateKey(now);
  const [year, month, day] = todayKey.split("-").map(Number);
  const [targetYear, targetMonth, targetDay] = targetKey.split("-").map(Number);
  const days = Math.round((Date.UTC(targetYear, targetMonth - 1, targetDay) - Date.UTC(year, month - 1, day)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return days > 1 ? `In ${days} days` : "Past due";
}
const getData = (response) => response.data?.data ?? [];
const DRAW_STATUS_LABELS = { UPCOMING: "Upcoming", READY_FOR_RESULT: "Ready for Result", COMPLETED: "Completed" };
const DRAW_STATUS_BADGE_CLASS = { UPCOMING: "upcoming", READY_FOR_RESULT: "ready", COMPLETED: "success" };
function formatCountdown(drawDate) {
  const diffMs = new Date(drawDate).getTime() - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "Draw time has passed";
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  return days ? `${days}d ${clock}` : clock;
}

function ProtectedRoute({ children }) {
  return localStorage.getItem("adminToken") ? children : <Navigate to="/login" replace />;
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await API.post("/auth/login", form);
      if (response.data?.data?.role !== "ADMIN") {
        setError("This account does not have administrator access.");
        return;
      }
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminName", response.data.data.fullName || "Administrator");
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.status === 403 ? "Administrator access required." : requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-screen"><section className="auth-panel"><img className="brand-logo auth-logo" src={thumbiLogo} alt="Lucky Horse Lotteries logo" /><h1>Lucky Horse Lotteries</h1><p>Manage draws, players, tickets, and payouts in one place.</p><form onSubmit={submit}><label>Username or email<input required autoFocus value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label><label>Password<div className="password-field"><input required type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label>{error && <div className="error-box">{error}</div>}<button className="primary-button wide" disabled={busy}>{busy ? "Logging in..." : "Login"}</button></form><small>Administrator access is verified securely.</small></section></main>;
}

function NotificationBell({ unread }) { return <Link className="header-bell" to="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>♢{unread > 0 && <b className="notification-count">{unread > 99 ? "99+" : unread}</b>}</Link>; }

function Shell() {
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    async function loadNotifications() {
      try {
        setUnread(getData(await API.get("/admin/notifications")).filter((item) => !item.read).length);
      } catch {
        setUnread(0);
      }
    }
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);
  function logout() { localStorage.removeItem("adminToken"); localStorage.removeItem("adminName"); navigate("/login", { replace: true }); }
  return (
    <div className="admin-app">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="sidebar-brand">
          <div className="brand-circle"><img className="brand-logo sidebar-logo" src={thumbiLogo} alt="Lucky Horse Lotteries logo" /></div>
          <div className="brand-text">
            <strong>Lucky Horse</strong>
            <span>Lotteries</span>
          </div>
        </div>
        <div className="admin-panel-pill">Admin Panel</div>
        <nav>
          {navItems.map(([label, path, icon]) => (
            <NavLink key={path} to={path} onClick={() => setMobileNav(false)} className={({ isActive }) => isActive ? "active" : ""}>
              <i>{icon}</i>
              <span>{label}</span>
              {label === "Notifications" && unread > 0 && <b className="nav-count">{unread > 99 ? "99+" : unread}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="sidebar-card-icon">✦</div>
          <div>
            <strong>Lucky Horse</strong>
            <small>Most Trusted</small>
          </div>
          <span>Lottery Platform</span>
        </div>
        <div className="sidebar-foot"><span className="status-dot" />Live API Connected</div>
        <small className="sidebar-version">v1.0.0</small>
      </aside>
      {mobileNav && <button className="sidebar-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <div className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Open navigation">☰</button>
          <div className="topbar-search">
            <span className="search-icon">⌕</span>
            <input type="search" placeholder="Search anything..." aria-label="Search anything" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter") {
                const match = navItems.find(([label]) => label.toLowerCase().includes(search.trim().toLowerCase()));
                if (match && search.trim()) { navigate(match[1]); setSearch(""); }
              }
              if (event.key === "Escape") setSearch("");
            }} />
            {search.trim() && <div className="search-results">{navItems.filter(([label]) => label.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 5).map(([label, path]) => <Link key={path} to={path} onClick={() => setSearch("")}>{label}<span>Open</span></Link>)}</div>}
          </div>
          <div className="topbar-actions">
            <NotificationBell unread={unread} />
            <div className="profile-menu-wrap">
              <button className="admin-profile" aria-expanded={profileOpen} aria-label="Open administrator profile menu" onClick={() => setProfileOpen((open) => !open)}>
                <div className="profile-avatar">A</div>
                <div className="profile-meta">
                  <span className="profile-name">{localStorage.getItem("adminName") || "Admin"}</span>
                  <small>Administrator</small>
                </div>
                <span className="caret">▾</span>
              </button>
              {profileOpen && <div className="profile-menu"><strong>{localStorage.getItem("adminName") || "Admin"}</strong><small>Administrator</small><button onClick={logout}><span aria-hidden="true">↪</span>Log out</button></div>}
            </div>
            <button className="ghost-button logout-button" onClick={logout}><span aria-hidden="true">↪</span>Log out</button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}

function Loading() { return <div className="loading-state"><span className="spinner" />Loading data...</div>; }
function Empty({ text = "No records found." }) { return <div className="empty-state"><strong>{text}</strong><span>New activity will appear here when it is available.</span></div>; }
function ErrorState({ message, retry }) { return <div className="error-box"><strong>Could not load this view.</strong><span>{message}</span>{retry && <button className="text-button" onClick={retry}>Try again</button>}</div>; }
function StatusBadge({ active = true, label }) { return <span className={`status-badge ${active ? "success" : "muted"}`}><span />{label || (active ? "Active" : "Inactive")}</span>; }

const lotteryArtworkByName = [
  ["karunya plus", karunyaPlusArtwork],
  ["nagaland day", nagalandDayArtwork],
  ["nagaland evening", nagalandEveningArtwork],
  ["nagaland morning", nagalandMorningArtwork],
  ["bhagyathara", bhagyatharaArtwork],
  ["karunya", karunyaArtwork],
  ["samrudhi", samrudhiArtwork],
  ["sthree sakthi", sthreesakthiArtwork],
  ["suvarna kerala", suvarnaKeralamArtwork],
  ["suvarna keralam", suvarnaKeralamArtwork],
  ["win win", winWinArtwork],
  ["kerala", keralaArtwork],
];

const artworkFields = [
  "image", "image_url", "imageUrl", "logo", "logo_url", "logoUrl",
  "thumbnail", "thumbnail_url", "thumbnailUrl", "artwork", "artwork_url", "artworkUrl",
];

function imageUrlFrom(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    return [value.url, value.secure_url, value.src, value.path].find((candidate) => typeof candidate === "string" && candidate.trim())?.trim() || "";
  }
  return "";
}

function localLotteryArtwork(name = "") {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return lotteryArtworkByName.find(([key]) => normalizedName.includes(key))?.[1] || lotteryArtwork;
}

function lotteryArtworkFor(lottery) {
  for (const field of artworkFields) {
    const imageUrl = imageUrlFrom(lottery?.[field]);
    if (imageUrl) return imageUrl;
  }
  return localLotteryArtwork(lottery?.lotteryName || lottery?.name || "");
}

function activityChartData(activity = [], range = "today") {
  const today = new Date().toLocaleDateString("en-CA", IST_FORMAT);
  const [year, month, day] = today.split("-").map(Number);
  const todayUtc = Date.UTC(year, month - 1, day);
  const bucketCount = range === "7" ? 7 : 6;
  const series = { bets: Array(bucketCount).fill(0), deposits: Array(bucketCount).fill(0), withdrawals: Array(bucketCount).fill(0) };
  for (const item of activity) {
    const date = new Date(item.createdAt);
    if (!Number.isFinite(date.getTime())) continue;
    const eventDay = date.toLocaleDateString("en-CA", IST_FORMAT);
    let bucket;
    if (range === "today") {
      if (eventDay !== today) continue;
      const hour = Number(new Intl.DateTimeFormat("en-GB", { ...IST_FORMAT, hour: "2-digit", hourCycle: "h23" }).format(date));
      bucket = Math.min(5, Math.floor(hour / 4));
    } else {
      const [eventYear, eventMonth, eventDate] = eventDay.split("-").map(Number);
      const age = Math.floor((todayUtc - Date.UTC(eventYear, eventMonth - 1, eventDate)) / 86400000);
      const days = range === "7" ? 7 : 30;
      if (age < 0 || age >= days) continue;
      bucket = range === "7" ? 6 - age : 5 - Math.floor(age / 5);
      bucket = Math.max(0, Math.min(bucketCount - 1, bucket));
    }
    const action = String(item.action || "").toUpperCase();
    const key = action.includes("TICKET_PURCHASED") ? "bets" : action.includes("DEPOSIT") ? "deposits" : action.includes("WITHDRAW") ? "withdrawals" : null;
    if (key) series[key][bucket] += 1;
  }
  const labels = range === "today"
    ? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    : range === "7"
      ? Array.from({ length: 7 }, (_, index) => new Date(todayUtc - (6 - index) * 86400000).toLocaleDateString("en-IN", { timeZone: IST_FORMAT.timeZone, weekday: "short" }))
      : Array.from({ length: 6 }, (_, index) => new Date(todayUtc - (29 - index * 5) * 86400000).toLocaleDateString("en-IN", { timeZone: IST_FORMAT.timeZone, day: "numeric", month: "short" }));
  return { series, labels };
}

function activityPath(values, maximum, closeArea = false) {
  const points = values.map((value, index) => ({
    x: 48 + index * (570 / Math.max(values.length - 1, 1)),
    y: 174 - (value / maximum) * 148,
  }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middle = (previous.x + current.x) / 2;
    path += ` C ${middle} ${previous.y}, ${middle} ${current.y}, ${current.x} ${current.y}`;
  }
  return closeArea ? `${path} L ${points.at(-1).x} 184 L ${points[0].x} 184 Z` : path;
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const format = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${format(start)} - ${format(end)}`;
}

const LOTTERY_THEME_MAP = {
  kerala: { start: "#ff5a75", end: "#f43f5e" },
  blue: { start: "#38bdf8", end: "#2563eb" },
  green: { start: "#4ade80", end: "#0ea56d" },
  orange: { start: "#fbbf24", end: "#f97316" },
  gold: { start: "#f5c451", end: "#f59e0b" },
  pink: { start: "#ff7db9", end: "#f43f9d" },
  teal: { start: "#2dd4bf", end: "#14b8a6" },
  magenta: { start: "#ff73d7", end: "#d946ef" },
  purple: { start: "#8b5cf6", end: "#6d28d9" },
  violet: { start: "#a78bfa", end: "#7c3aed" },
  coral: { start: "#fb7185", end: "#f97316" },
  cyan: { start: "#22d3ee", end: "#0ea5e9" },
  amber: { start: "#fbbf24", end: "#f97316" },
  rose: { start: "#f9a8d4", end: "#ec4899" },
};

const LOTTERY_THEME_KEYWORDS = [
  ["kerala", "kerala"],
  ["win win", "blue"],
  ["winwin", "blue"],
  ["karunya", "green"],
  ["karunya plus", "orange"],
  ["suvarna", "gold"],
  ["samrudhi", "pink"],
  ["bhagyathara", "teal"],
  ["nagaland day", "magenta"],
  ["nagaland evening", "blue"],
  ["deer", "purple"],
  ["akshaya", "pink"],
  ["sthree sakthi", "purple"],
  ["sthree sakthi", "purple"],
];

function resolveLotteryTheme(lottery = {}) {
  if (lottery.cardTheme && LOTTERY_THEME_MAP[lottery.cardTheme]) return lottery.cardTheme;

  const name = String(lottery.lotteryName || lottery.name || "").toLowerCase();
  const matchedTheme = LOTTERY_THEME_KEYWORDS.find(([keyword]) => name.includes(keyword));
  if (matchedTheme) return matchedTheme[1];

  return "purple";
}

function Dashboard() {
  const [state, setState] = useState({ loading: true, error: "", data: null, activity: [] });
  const [lotteries, setLotteries] = useState([]);
  const [activityRange, setActivityRange] = useState("today");
  const [now, setNow] = useState(Date.now());

  async function load() {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const [dashboardResponse, lotteryResponse, activityResponse] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/lotteries"),
        API.get("/admin/activity"),
      ]);
      setState({
        loading: false,
        error: "",
        data: getData(dashboardResponse),
        activity: getData(activityResponse),
      });
      setLotteries(getData(lotteryResponse));
    } catch (e) {
      setState((current) => ({
        ...current,
        loading: false,
        error: e.response?.data?.message || e.message,
      }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = state.data
    ? [
        ["Total Users", state.data.totalUsers, "Registered accounts", "purple", "♙"],
        [
          "Total Lotteries",
          state.data.totalLotteries,
          `${state.data.activeLotteries} active draws`,
          "blue",
          "◉",
        ],
        [
          "Today's Bets",
          state.data.todaysBets,
          "Tickets created today",
          "green",
          "▤",
        ],
        [
          "Today's Betting Amount",
          money(state.data.todaysBettingAmount),
          "Ticket value today",
          "orange",
          "₹",
        ],
        ["Total Winners", state.data.totalWinners, "Winning tickets", "rose", "★"],
        [
          "Total Winning Amount",
          money(state.data.totalWinningAmount),
          "Paid and recorded",
          "purple",
          "₹",
        ],
        [
          "Total Deposits",
          money(state.data.totalDeposits),
          "Wallet deposits",
          "blue",
          "▣",
        ],
        [
          "Total Withdrawals",
          money(state.data.totalWithdrawals),
          "Wallet withdrawals",
          "teal",
          "↗",
        ],
      ]
    : [];

  const chart = activityChartData(state.activity, activityRange);
  const chartData = chart.series;
  const hasChartData = Object.values(chartData).some((values) => values.some((value) => value > 0));
  const chartMaximum = hasChartData ? Math.max(...Object.values(chartData).flat()) : 1;
  const upcomingLotteries = useMemo(() => {
    if (!lotteries.length) return [];
    return lotteries
      .filter((lottery) => lottery.isActive !== false && lottery.nextDrawDate && new Date(lottery.nextDrawDate).getTime() > now)
      .sort((left, right) => new Date(left.nextDrawDate) - new Date(right.nextDrawDate))
      .slice(0, 1);
  }, [lotteries, now]);

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live summary of activity across the lottery platform."
        action={
          <div className="dashboard-header-actions">
            <label className="date-chip"><span aria-hidden="true">▦</span><select aria-label="Activity date range" value={activityRange} onChange={(event) => setActivityRange(event.target.value)}><option value="today">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></label>
            <button className="primary-button refresh-btn" onClick={load} disabled={state.loading}><span className={`refresh-icon${state.loading ? " is-spinning" : ""}`} aria-hidden="true">↻</span>Refresh</button>
          </div>
        }
      />
      {state.loading && !state.data ? (
        <Loading />
      ) : state.error && !state.data ? (
        <ErrorState message={state.error} retry={load} />
      ) : (
        <>
          {state.error && <ErrorState message={state.error} retry={load} />}
          <div className="metric-grid">
            {cards.map(([label, value, hint, color, icon]) => (
              <article className={`metric-card card-${color}`} key={label}>
                <div className="metric-icon">{icon}</div>
                <div className="metric-copy">
                  <span>{label}</span>
                  <strong>{value ?? 0}</strong>
                  <small>{hint}</small>
                </div>
                <svg className="metric-sparkline" viewBox="0 0 92 30" aria-hidden="true"><path d="M2 25 C 13 24, 14 15, 24 19 S 39 21, 47 12 S 61 19, 70 11 S 82 10, 90 2" /></svg>
              </article>
            ))}
          </div>
          <section className="dashboard-lower-grid">
            <article className="panel chart-panel">
              <div className="panel-title">
                <div className="panel-heading-copy"><span className="section-icon">⌁</span><div><h2>{activityRange === "today" ? "Today's Activity" : `Activity · Last ${activityRange} days`}</h2><p>{activityRange === "today" ? "Real-time overview of platform activity" : "Recorded bets, deposits, and withdrawals"}</p></div></div>
              </div>
              <div className="activity-legend"><span><i className="legend-dot" />Bets</span><span><i className="legend-dot deposits" />Deposits</span><span><i className="legend-dot withdrawals" />Withdrawals</span></div>
              {!hasChartData ? (
                <div className="chart-empty-state">No activity recorded yet.</div>
              ) : (
                <svg className="activity-chart" viewBox="0 0 640 220" role="img" aria-label="Recorded bets, deposits, and withdrawals over the selected period">
                  {[26, 100, 174].map((y, index) => <g key={y}><line className="chart-grid-line" x1="48" x2="618" y1={y} y2={y} /><text className="chart-axis-label" x="8" y={y + 4}>{index === 0 ? chartMaximum : index === 1 ? Math.round(chartMaximum / 2) : 0}</text></g>)}
                  {chart.labels.map((_, index) => { const x = 48 + index * (570 / Math.max(chart.labels.length - 1, 1)); return <line className="chart-grid-line vertical" key={index} x1={x} x2={x} y1="26" y2="184" />; })}
                  <path className="chart-area bets" d={activityPath(chartData.bets, chartMaximum, true)} />
                  <path className="chart-area deposits" d={activityPath(chartData.deposits, chartMaximum, true)} />
                  <path className="chart-area withdrawals" d={activityPath(chartData.withdrawals, chartMaximum, true)} />
                  <path className="chart-line bets" pathLength="1" d={activityPath(chartData.bets, chartMaximum)} />
                  <path className="chart-line deposits" pathLength="1" d={activityPath(chartData.deposits, chartMaximum)} />
                  <path className="chart-line withdrawals" pathLength="1" d={activityPath(chartData.withdrawals, chartMaximum)} />
                  {chart.labels.map((label, index) => <text className="chart-axis-label" key={`${label}-${index}`} x={48 + index * (570 / Math.max(chart.labels.length - 1, 1))} y="207" textAnchor="middle">{label}</text>)}
                </svg>
              )}
            </article>
            <article className="panel recent-activity-panel">
              <div className="panel-title"><div><h2>Recent Activity</h2></div><Link className="text-button" to="/activity">View All →</Link></div>
              {state.activity?.length ? <div className="activity-feed">{state.activity.slice(0, 5).map((item) => <div className="activity-feed-item" key={item.id}><span className="feed-icon">{String(item.action || "").includes("TICKET") ? "▤" : String(item.action || "").includes("WINNER") ? "★" : String(item.action || "").includes("USER") ? "♙" : "✦"}</span><div className="feed-copy"><strong>{item.title}</strong><p>{item.message}</p></div><small title={`${dateText(item.createdAt)} ${timeText(item.createdAt)}`}>{dateText(item.createdAt)} {timeText(item.createdAt)}</small></div>)}</div> : <Empty text="No activity recorded yet." />}
            </article>
          </section>
        </>
      )}
      <section className="panel upcoming-panel">
        <div className="panel-title"><div className="panel-heading-copy"><span className="section-icon calendar-icon">▦</span><div><h2>Upcoming Draw</h2><p>Next scheduled lottery draw details</p></div></div><Link className="text-button" to="/lotteries">View All Lotteries →</Link></div>
        {upcomingLotteries.length ? (
          <div className="upcoming-lottery-cards">
            {upcomingLotteries.map((lottery) => {
              const theme = resolveLotteryTheme(lottery);
              const palette = LOTTERY_THEME_MAP[theme] || LOTTERY_THEME_MAP.purple;
              const bannerImage = imageUrlFrom(lottery.backgroundImage || lottery.bannerImage || lottery.cardBackgroundImage || lottery.background_image);
              const themeStyle = {
                backgroundColor: palette.start,
                backgroundImage: `linear-gradient(90deg, rgba(40, 17, 65, .3) 0%, rgba(40, 17, 65, .08) 48%, rgba(40, 17, 65, .14) 100%), url("${bannerImage || lotteryBanner}")`,
              };
              const imageUrl = lotteryArtworkFor(lottery);
              const category = lottery.categoryName || lottery.category || lottery.lotteryType || "Lottery";
              const drawName = lottery.drawName || lottery.drawTitle || lottery.lotteryName || "Upcoming draw";
              const drawDate = lottery.nextDrawDate ? new Date(lottery.nextDrawDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "TBD";
              const drawTime = lottery.nextDrawDate ? new Date(lottery.nextDrawDate).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) : "TBD";

              return (
                <article className={`upcoming-lottery-card theme-${theme}`} key={lottery.id} style={themeStyle}>
                  <div className="upcoming-draw-logo">
                    {imageUrl ? <img src={imageUrl} alt={`${lottery.lotteryName} logo`} onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }} /> : <span>{String(lottery.shortName || lottery.lotteryName || "LH").slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="upcoming-draw-copy">
                    <span className="upcoming-draw-category">{category}</span>
                    <h3>{drawName}</h3>
                    <span className="upcoming-draw-status">Upcoming</span>
                    <span className="upcoming-draw-prize">First Prize <strong>{money(lottery.firstPrize || lottery.first_prize || 0)}</strong></span>
                  </div>
                  <div className="upcoming-draw-info-grid">
                    <div className="upcoming-draw-info"><span className="upcoming-draw-info-icon" aria-hidden="true">▦</span><strong>{drawDate}</strong><small>Draw Date</small></div>
                    <div className="upcoming-draw-info"><span className="upcoming-draw-info-icon" aria-hidden="true">◷</span><strong>{drawTime}</strong><small>Draw Time</small></div>
                    <div className="upcoming-draw-info"><span className="upcoming-draw-info-icon" aria-hidden="true">⌛</span><strong>{formatCountdown(lottery.nextDrawDate)}</strong><small>Time Remaining</small></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Empty text="No upcoming draws scheduled." />
        )}
      </section>
      <section className="panel quick-access-panel">
        <div className="panel-title"><div className="panel-heading-copy"><span className="section-icon quick-icon">✦</span><div><h2>Quick Access</h2><p>Jump straight to common admin tasks</p></div></div></div>
        <div className="quick-access-grid">
          {[
            ["Manage Lotteries", "Draw schedules and prizes", "/lotteries", "purple", "◉"],
            ["Inspect Tickets", "Review entries and status", "/tickets", "blue", "▤"],
            ["View Winners", "Review draw results", "/winners", "pink", "★"],
            ["Create Promotion", "Manage player campaigns", "/promotions", "gold", "✦"],
            ["Manage Users", "Accounts and wallet activity", "/users", "green", "♙"],
          ].map(([title, description, path, color, icon]) => <Link className={`quick-link ${color}`} to={path} key={path}><span className="quick-link-icon">{icon}</span><span className="quick-link-copy"><strong>{title}</strong><small>{description}</small></span><span className="quick-link-arrow" aria-hidden="true">→</span></Link>)}
        </div>
      </section>
    </div>
  );
}

const initialLottery = {
  lotteryName: "",
  shortName: "",
  drawDate: "",
  drawTime: "",
  drawFrequency: "DAILY",
  drawDayOfWeek: "",
  ticketPrice: "",
  firstPrize: "",
  secondPrize: "",
  thirdPrize: "",
  totalTickets: "",
  cardTheme: "purple",
  primaryColor: "",
  secondaryColor: "",
  backgroundImage: "",
  displayOrder: "",
  isActive: true,
  featured: false,
  logo: "",
};
const LOTTERY_CARD_THEMES = ["purple", "blue", "green", "coral", "cyan", "orange", "magenta"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function lotterySchedulePreview(value) {
  const time = value.drawTime || "Draw time";
  if (value.drawFrequency === "SPECIFIC_DATE") return `${value.drawDate || "Draw date"} ${time}`;
  if (value.drawFrequency === "WEEKLY") return `Every ${WEEKDAY_NAMES[Number(value.drawDayOfWeek)] || "weekday"} · ${time}`;
  return `Daily · ${time}`;
}

function LotteryForm({ value, onChange, onCancel, onSubmit, busy, edit, logoFile, onLogoFileChange }) {
  const [logoPreview, setLogoPreview] = useState(value.logo || "");

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(value.logo || "");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile, value.logo]);

  const previewStyle = {
    background: `linear-gradient(165deg, ${value.primaryColor || "var(--lottery-preview-start)"} 0%, ${value.secondaryColor || "var(--lottery-preview-end)"} 100%)`,
    ...(value.backgroundImage ? { backgroundImage: `linear-gradient(rgba(25, 12, 58, .18), rgba(25, 12, 58, .25)), url("${value.backgroundImage}")` } : {}),
  };

  return (
    <div className="lottery-admin-editor">
      <form className="form-grid content-form" onSubmit={onSubmit}>
        <label>Lottery name<input required value={value.lotteryName} onChange={(event) => onChange({ ...value, lotteryName: event.target.value })} placeholder="Enter lottery name" /></label>
        <label>Short name<input value={value.shortName} onChange={(event) => onChange({ ...value, shortName: event.target.value })} placeholder="e.g. AK" /></label>
        <label>Card theme<select value={value.cardTheme} onChange={(event) => onChange({ ...value, cardTheme: event.target.value })}>{LOTTERY_CARD_THEMES.map((theme) => <option key={theme} value={theme}>{theme.replace(/^./, (letter) => letter.toUpperCase())}</option>)}</select></label>
        <label>Primary color<input type="color" value={value.primaryColor || "#7c3aed"} onChange={(event) => onChange({ ...value, primaryColor: event.target.value })} /></label>
        <label>Secondary color<input type="color" value={value.secondaryColor || "#5b21b6"} onChange={(event) => onChange({ ...value, secondaryColor: event.target.value })} /></label>
        <label className={edit ? "" : "span-2"}>Logo URL<input value={value.logo} onChange={(event) => onChange({ ...value, logo: event.target.value })} placeholder="Paste a logo URL or upload a logo below" /></label>
        <label className={edit ? "" : "span-2"}>Upload logo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onLogoFileChange(event.target.files?.[0] || null)} /></label>
        {!edit && <label className="span-2">Decorative background image URL<input value={value.backgroundImage} onChange={(event) => onChange({ ...value, backgroundImage: event.target.value })} placeholder="Optional background image URL" /></label>}
        <label>First prize<input required min="0" step="0.01" type="number" value={value.firstPrize} onChange={(event) => onChange({ ...value, firstPrize: event.target.value })} /></label>
        <label>Display order<input min="0" step="1" type="number" value={value.displayOrder} onChange={(event) => onChange({ ...value, displayOrder: event.target.value })} /></label>
        <label>Draw frequency<select required value={value.drawFrequency} onChange={(event) => onChange({ ...value, drawFrequency: event.target.value })}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="SPECIFIC_DATE">Specific Date</option></select></label>
        {value.drawFrequency === "WEEKLY" && <label>Day of week<select required value={value.drawDayOfWeek} onChange={(event) => onChange({ ...value, drawDayOfWeek: event.target.value })}><option value="">Select a day</option>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>}
        {value.drawFrequency === "SPECIFIC_DATE" && <label>Draw date<input required min={istInputDate(new Date())} type="date" value={value.drawDate} onChange={(event) => onChange({ ...value, drawDate: event.target.value })} /></label>}
        <label>Draw time<input required type="time" step="60" value={value.drawTime} onChange={(event) => onChange({ ...value, drawTime: event.target.value })} /></label>
        <label>Ticket price<input required min="0" step="0.01" type="number" value={value.ticketPrice} onChange={(event) => onChange({ ...value, ticketPrice: event.target.value })} /></label>
        {!edit && <label>Total tickets<input min="0" type="number" value={value.totalTickets} onChange={(event) => onChange({ ...value, totalTickets: event.target.value })} /></label>}
        {!edit && <div className="form-divider span-2">Prize details</div>}
        {!edit && <label>Second prize<input min="0" step="0.01" type="number" value={value.secondPrize} onChange={(event) => onChange({ ...value, secondPrize: event.target.value })} /></label>}
        {!edit && <label>Third prize<input min="0" step="0.01" type="number" value={value.thirdPrize} onChange={(event) => onChange({ ...value, thirdPrize: event.target.value })} /></label>}
        {!edit && <label className="content-check"><input type="checkbox" checked={Boolean(value.featured)} onChange={(event) => onChange({ ...value, featured: event.target.checked })} /> Featured crown badge</label>}
        <label>Status<select value={value.isActive ? "active" : "inactive"} onChange={(event) => onChange({ ...value, isActive: event.target.value === "active" })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        {!edit && <aside className="lottery-admin-preview-wrap span-2"><h3>Frontend card preview</h3><article className={`lottery-admin-preview lottery-card--${value.cardTheme}`} style={previewStyle}><div className="lottery-admin-preview__media">{logoPreview ? <img src={logoPreview} alt="Lottery logo preview" /> : <span>{(value.shortName || value.lotteryName || "LH").slice(0, 2).toUpperCase()}</span>}</div>{value.featured && <span className="lottery-admin-preview__crown">♛</span>}<strong className="lottery-admin-preview__name">{value.lotteryName || "Lottery name"}</strong><b className="lottery-admin-preview__prize">₹{formatLotteryAmount(value.firstPrize)}</b><div className="lottery-admin-preview__meta"><span>♛ First Prize<strong>₹{formatLotteryAmount(value.firstPrize)}</strong></span><span>▦ Next Draw<strong>{lotterySchedulePreview(value)}</strong></span></div><span className="lottery-admin-preview__arrow">→</span></article></aside>}
        <div className="form-actions span-2"><button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : edit ? "Save Changes" : "Add lottery"}</button></div>
      </form>
    </div>
  );
}

function formatLotteryAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "0";
}

function lotteryFormFrom(item) {
  const date = item.drawDate ? new Date(item.drawDate) : null;
  return {
    lotteryName: item.lotteryName || "",
    shortName: item.shortName || "",
    drawDate: item.drawFrequency === "SPECIFIC_DATE" && date ? istInputDate(date) : "",
    drawTime: item.drawTime || (date ? istInputTime(date) : ""),
    drawFrequency: item.drawFrequency || "DAILY",
    drawDayOfWeek: item.drawDayOfWeek === null || item.drawDayOfWeek === undefined ? "" : String(item.drawDayOfWeek),
    ticketPrice: item.ticketPrice ?? "",
    firstPrize: item.firstPrize ?? "",
    secondPrize: item.secondPrize ?? "",
    thirdPrize: item.thirdPrize ?? "",
    totalTickets: item.totalTickets ?? "",
    cardTheme: item.cardTheme || "purple",
    primaryColor: item.primaryColor || "",
    secondaryColor: item.secondaryColor || "",
    backgroundImage: item.backgroundImage || "",
    displayOrder: item.displayOrder ?? "",
    isActive: item.isActive !== false,
    featured: Boolean(item.featured),
    logo: item.logo || "",
  };
}
function LotteryEntryAmounts() {
  const emptyForm = {
    singleDigitAmount: "",
    doubleDigitAmount: "",
    tripleDigitAmount: "",
    singleDigitWinningAmount: "",
    doubleDigitWinningAmount: "",
    tripleDigitWinningAmount: "",
  };
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = getData(await API.get("/admin/lottery-entry-amounts"));
      setSaved(data);
      setForm({
        singleDigitAmount: data.singleDigitAmount,
        doubleDigitAmount: data.doubleDigitAmount,
        tripleDigitAmount: data.tripleDigitAmount,
        singleDigitWinningAmount: data.singleDigitWinningAmount,
        doubleDigitWinningAmount: data.doubleDigitWinningAmount,
        tripleDigitWinningAmount: data.tripleDigitWinningAmount,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validate(value, label) {
    if (value === "" || value === null || value === undefined)
      return `${label} is required`;
    const amount = Number(value);
    if (!Number.isFinite(amount)) return `${label} must be a valid number`;
    if (amount < 0) return `${label} cannot be negative`;
    if (amount <= 0) return `${label} must be greater than 0`;
    return "";
  }

  async function save(event) {
    event.preventDefault();
    const message =
      validate(form.singleDigitAmount, "Single Digit entry amount") ||
      validate(form.doubleDigitAmount, "Double Digit entry amount") ||
      validate(form.tripleDigitAmount, "Triple Digit entry amount") ||
      validate(form.singleDigitWinningAmount, "Single Digit winning amount") ||
      validate(form.doubleDigitWinningAmount, "Double Digit winning amount") ||
      validate(form.tripleDigitWinningAmount, "Triple Digit winning amount");
    if (message) {
      setNotice("");
      setError(message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await API.put("/admin/lottery-entry-amounts", {
        singleDigitAmount: Number(form.singleDigitAmount),
        doubleDigitAmount: Number(form.doubleDigitAmount),
        tripleDigitAmount: Number(form.tripleDigitAmount),
        singleDigitWinningAmount: Number(form.singleDigitWinningAmount),
        doubleDigitWinningAmount: Number(form.doubleDigitWinningAmount),
        tripleDigitWinningAmount: Number(form.tripleDigitWinningAmount),
      });
      const data = response.data?.data || {};
      setSaved(data);
      setForm({
        singleDigitAmount: data.singleDigitAmount,
        doubleDigitAmount: data.doubleDigitAmount,
        tripleDigitAmount: data.tripleDigitAmount,
        singleDigitWinningAmount: data.singleDigitWinningAmount,
        doubleDigitWinningAmount: data.doubleDigitWinningAmount,
        tripleDigitWinningAmount: data.tripleDigitWinningAmount,
      });
      setNotice("Lottery entry amounts saved.");
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to save lottery entry amounts.",
      );
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["singleDigitAmount", "Single Digit"],
    ["doubleDigitAmount", "Double Digit"],
    ["tripleDigitAmount", "Triple Digit"],
  ];

  const winningFields = [
    ["singleDigitWinningAmount", "Single Digit"],
    ["doubleDigitWinningAmount", "Double Digit"],
    ["tripleDigitWinningAmount", "Triple Digit"],
  ];

  return (
    <>
      <PageHeader
        crumb="Lottery / Entry Amounts"
        title="Lottery Entry Amounts"
        description="Configure the base demo-credit amount for Single, Double, and Triple Digit entries. These values appear on the lottery page and cannot be edited by players."
        action={
          <div className="info-pill">
            i These settings control the default demo credits and winning
            amounts shown to users.
          </div>
        }
      />
      {notice && <div className="toast">{notice}</div>}
      {loading ? (
        <Loading />
      ) : error && !saved ? (
        <ErrorState message={error} retry={load} />
      ) : (
        <form className="lottery-amount-form" onSubmit={save}>
          {error && <div className="error-box">{error}</div>}
          <section className="panel lottery-amount-panel">
            <div className="amount-panel-heading">
              <span className="amount-section-icon">▤</span>
              <div>
                <h2>Base Demo Credits</h2>
                <p>
                  Set the demo credit value for each lottery entry type. These
                  are used for practice play.
                </p>
              </div>
            </div>
            <div className="lottery-amount-grid">
              {fields.map(([key, label], index) => (
                <article
                  className={`lottery-amount-card ${key.includes("single") ? "card-purple" : key.includes("double") ? "card-blue" : "card-orange"}`}
                  key={key}
                >
                  <span className="amount-decoration" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="amount-header">
                    <span className="amount-badge">{index + 1}</span>
                    <div className="amount-title-block">
                      <strong>{label.toUpperCase()}</strong>
                      <span>Base demo credits</span>
                    </div>
                  </div>
                  <label className="amount-input-label">
                    <input
                      aria-label={`${label} base demo credits`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={form[key]}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    />
                  </label>
                  <small className="amount-saved-value">
                    <span aria-hidden="true">ⓘ</span>Current saved value:{" "}
                    {saved
                      ? `${Number(saved[key]).toLocaleString("en-IN", { maximumFractionDigits: 2 })} demo credits`
                      : "Not saved yet"}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel lottery-amount-panel">
            <div className="amount-panel-heading">
              <span className="amount-section-icon trophy">🏆</span>
              <div>
                <h2>Winning / Prize Amounts</h2>
                <p>
                  Set the winning amounts for each entry type. These amounts are
                  paid to a winning ticket.
                </p>
              </div>
            </div>
            <div className="lottery-amount-grid">
              {winningFields.map(([key, label], index) => (
                <article
                  className={`lottery-amount-card ${key.includes("single") ? "card-green" : key.includes("double") ? "card-blue" : "card-orange"}`}
                  key={key}
                >
                  <span
                    className="amount-decoration trophy-decoration"
                    aria-hidden="true"
                  >
                    ♛
                  </span>
                  <div className="amount-header">
                    <span className="amount-badge trophy">🏆</span>
                    <div className="amount-title-block">
                      <strong>{label.toUpperCase()}</strong>
                      <span>Winning amount (₹)</span>
                    </div>
                  </div>
                  <label className="amount-input-label">
                    <input
                      aria-label={`${label} winning amount`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={form[key]}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    />
                  </label>
                  <small className="amount-saved-value">
                    <span aria-hidden="true">ⓘ</span>Current saved value:{" "}
                    {saved ? money(saved[key]) : "Not saved yet"}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <div className="panel lottery-amount-footer">
            <button type="button" className="secondary-button" onClick={load}>
              ↻ Reset to Default
            </button>
            <button className="primary-button" disabled={busy}>
              {busy ? "Saving..." : "▣ Save Changes"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

function Lotteries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialLottery);
  const [logoFile, setLogoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawFilter, setDrawFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nextDraw");
  const [now, setNow] = useState(Date.now());
  async function load(quiet = false) {
    try {
      if (!quiet) setLoading(true);
      setError("");
      setItems(getData(await API.get("/admin/lotteries")));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const refreshTimer = window.setInterval(() => {
      setNow(Date.now());
      load(true);
    }, 60000);
    return () => window.clearInterval(refreshTimer);
  }, []);
  const todayKey = istDateKey(now);
  const tomorrowKey = (() => {
    const [year, month, day] = todayKey.split("-").map(Number);
    const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
    return `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth() + 1).padStart(2, "0")}-${String(tomorrow.getUTCDate()).padStart(2, "0")}`;
  })();
  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const drawKey = istDateKey(item.nextDrawDate);
      if (normalizedSearch && !`${item.lotteryName || ""} ${item.shortName || ""}`.toLowerCase().includes(normalizedSearch)) return false;
      if (statusFilter === "active" && item.isActive === false) return false;
      if (statusFilter === "disabled" && item.isActive !== false) return false;
      if (drawFilter === "today" && drawKey !== todayKey) return false;
      if (drawFilter === "tomorrow" && drawKey !== tomorrowKey) return false;
      if (drawFilter === "upcoming" && (!drawKey || drawKey <= tomorrowKey)) return false;
      return true;
    });
    return filtered.sort((left, right) => {
      if (sortBy === "firstPrize") return Number(right.firstPrize || 0) - Number(left.firstPrize || 0);
      if (sortBy === "ticketPrice") return Number(left.ticketPrice || 0) - Number(right.ticketPrice || 0);
      if (sortBy === "name") return String(left.lotteryName || "").localeCompare(String(right.lotteryName || ""));
      return new Date(left.nextDrawDate || "9999-12-31").getTime() - new Date(right.nextDrawDate || "9999-12-31").getTime();
    });
  }, [items, search, statusFilter, drawFilter, sortBy, todayKey, tomorrowKey]);
  function openAdd() {
    const nextOrder = items.reduce((highest, item) => Math.max(highest, Number(item.displayOrder) || 0), 0) + 1;
    setForm({ ...initialLottery, displayOrder: String(nextOrder) });
    setLogoFile(null);
    setSaveError("");
    setModal("add");
  }
  function openEdit(item) {
    setForm(lotteryFormFrom(item));
    setLogoFile(null);
    setSaveError("");
    setModal(item);
  }
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setSaveError("");
    if (form.drawFrequency === "SPECIFIC_DATE" && form.drawDate < istInputDate(new Date())) {
      setSaveError("Draw date must be today or a future date.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        drawDate: form.drawFrequency === "SPECIFIC_DATE" ? form.drawDate : "",
        drawDayOfWeek: form.drawFrequency === "WEEKLY" ? Number(form.drawDayOfWeek) : "",
        ticketPrice: Number(form.ticketPrice),
        firstPrize: Number(form.firstPrize),
        secondPrize: Number(form.secondPrize || 0),
        thirdPrize: Number(form.thirdPrize || 0),
        totalTickets: Number(form.totalTickets || 0),
        displayOrder: Number(form.displayOrder || 0),
      };
      const body = logoFile ? new FormData() : payload;
      if (logoFile) {
        Object.entries(payload).forEach(([key, value]) => body.append(key, String(value ?? "")));
        body.append("image", logoFile);
      }
      const response = modal === "add"
        ? await API.post("/admin/lotteries", body)
        : await API.put(`/admin/lotteries/${modal.id}`, body);
      const savedLottery = response.data?.data;
      if (modal !== "add" && savedLottery) {
        setItems((current) => current.map((item) => item.id === modal.id ? savedLottery : item));
      }
      setModal(null);
      setLogoFile(null);
      setNotice("Lottery saved successfully.");
      await load(true);
    } catch (e) {
      setSaveError(e.response?.data?.message || "Unable to save lottery. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function toggle(item) {
    try {
      await API.patch(`/admin/lotteries/${item.id}/status`, {
        isActive: !item.isActive,
      });
      setNotice("Lottery status updated.");
      await load();
    } catch (e) {
      setNotice(e.response?.data?.message || "Unable to update status.");
    }
  }
  async function remove(item) {
    if (!window.confirm(`Delete ${item.lotteryName}? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/lotteries/${item.id}`);
      setNotice(`${item.lotteryName} was deleted.`);
      await load();
    } catch (e) {
      setNotice(e.response?.data?.message || "Unable to delete this lottery.");
    }
  }
  return (
    <div className="admin-lotteries-page">
      <PageHeader
        eyebrow="Catalog"
        title="Lotteries"
        description="Manage draw schedules, prizes, pricing, availability and lottery settings."
        action={
          <button className="primary-button" onClick={openAdd}>
            + Add Lottery
          </button>
        }
      />
      {notice && <div className="toast" role="status">{notice}</div>}
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : (
        <>
          <section className="admin-lottery-filters" aria-label="Search and filter lotteries">
            <label className="admin-lottery-search"><span>Search lottery</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or short name" /></label>
            <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All</option><option value="active">Active</option><option value="disabled">Disabled</option></select></label>
            <label><span>Draw</span><select value={drawFilter} onChange={(event) => setDrawFilter(event.target.value)}><option value="all">All</option><option value="today">Today</option><option value="tomorrow">Tomorrow</option><option value="upcoming">Upcoming</option></select></label>
            <label><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="nextDraw">Next Draw</option><option value="firstPrize">First Prize</option><option value="ticketPrice">Ticket Price</option><option value="name">Name</option></select></label>
          </section>

          <section className="panel admin-lotteries-panel">
            <div className="admin-lottery-table-wrap">
            <table className="admin-lotteries-table">
              <thead>
                <tr>
                  <th>Lottery</th>
                  <th>First Prize</th>
                  <th>Next Draw</th>
                  <th>Ticket Price</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td className="admin-lottery-name-cell">
                      <div className="admin-lottery-identity">
                        {item.logo ? <img className="admin-lottery-logo" src={item.logo} alt="" /> : <span className={`admin-lottery-logo-fallback ${item.cardTheme || "purple"}`}>{String(item.shortName || item.lotteryName || "LH").slice(0, 2).toUpperCase()}</span>}
                        <div><strong>{item.lotteryName}</strong><small>{item.shortName || "Short name not set"}</small></div>
                      </div>
                    </td>
                    <td>{money(item.firstPrize)}</td>
                    <td>
                      {item.nextDrawDate ? <div className="admin-next-draw"><div><strong>{dateText(item.nextDrawDate)}</strong><small>{lotteryTimeText(item.nextDrawDate)}</small></div><span className="admin-draw-relative">{relativeDrawLabel(item.nextDrawDate, now)}</span></div> : <span className="admin-no-draw">No upcoming draw</span>}
                    </td>
                    <td>{money(item.ticketPrice)}</td>
                    <td>
                      <StatusBadge active={item.isActive !== false} />
                    </td>
                    <td>{item.displayOrder ?? item.id}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => toggle(item)}
                        >
                          {item.isActive === false ? "Enable" : "Disable"}
                        </button>
                        <button type="button" className="danger-button small-button" onClick={() => remove(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {visibleItems.length === 0 && <Empty text={items.length ? "No lotteries match these filters." : "No lotteries available."} />}
          </section>
        </>
      )}
      {modal && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setModal(null); }}>
          <section className={`modal content-modal lottery-admin-modal ${modal === "add" ? "lottery-admin-modal--add" : "lottery-admin-modal--edit"}`} role="dialog" aria-modal="true" aria-labelledby="lottery-modal-title">
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {modal === "add" ? "New draw" : `Lottery #${modal.id}`}
                </span>
                <h2 id="lottery-modal-title">{modal === "add" ? "Add lottery" : "Edit Lottery"}</h2>
              </div>
              <button type="button" className="close-button" aria-label="Close dialog" disabled={busy} onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            {saveError && <div className="error-box lottery-save-error" role="alert">{saveError}</div>}
            <LotteryForm
              value={form}
              onChange={setForm}
              onCancel={() => setModal(null)}
              onSubmit={save}
              busy={busy}
              edit={modal !== "add"}
              logoFile={logoFile}
              onLogoFileChange={setLogoFile}
            />
          </section>
        </div>
      )}
    </div>
  );
}

function Tickets() {
  const [items, setItems] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [filters, setFilters] = useState({
    lotteryId: "",
    date: "",
    userId: "",
    ticketId: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  async function load() {
    try {
      setLoading(true);
      const query = Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      const [tickets, lotteryList] = await Promise.all([
        API.get(`/admin/tickets${query ? `?${query}` : ""}`),
        API.get("/admin/lotteries"),
      ]);
      setItems(getData(tickets));
      setLotteries(getData(lotteryList));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filters]);
  const pageItems = items.slice((page - 1) * 10, page * 10);
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Tickets"
        description="Search and inspect every ticket recorded by the platform."
        action={
          <button className="secondary-button" onClick={load}>
            ↻ Refresh
          </button>
        }
      />
      <section className="filter-bar">
        <input
          placeholder="Ticket ID"
          value={filters.ticketId}
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, ticketId: e.target.value });
          }}
        />
        <select
          value={filters.lotteryId}
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, lotteryId: e.target.value });
          }}
        >
          <option value="">All lotteries</option>
          {lotteries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.lotteryName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <input
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
        <button
          className="secondary-button"
          onClick={() =>
            setFilters({
              lotteryId: "",
              date: "",
              userId: "",
              ticketId: "",
              status: "",
            })
          }
        >
          Clear
        </button>
      </section>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : (
        <section className="panel">
          <div className="panel-meta">
            {items.length} ticket{items.length === 1 ? "" : "s"} found
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Lottery</th>
                  <th>Bet</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="mono">{ticket.ticketNumber}</td>
                    <td>
                      <strong>
                        {ticket.User?.fullName || `User #${ticket.UserId}`}
                      </strong>
                      <small>
                        {ticket.User?.username || ticket.User?.mobile || "-"}
                      </small>
                    </td>
                    <td>
                      {ticket.Lottery?.lotteryName ||
                        `Lottery #${ticket.LotteryId}`}
                    </td>
                    <td>
                      <strong>{ticket.betType}</strong>
                      <small>Number {ticket.selectedNumber}</small>
                    </td>
                    <td>{money(ticket.amount)}</td>
                    <td>
                      <StatusBadge
                        active={ticket.status === "WON"}
                        label={ticket.status}
                      />
                    </td>
                    <td>
                      {dateText(ticket.createdAt)}{" "}
                      {ticket.Lottery?.drawDate
                        ? `· Draw ${dateText(ticket.Lottery.drawDate)} ${timeText(ticket.Lottery.drawDate)}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageItems.length === 0 && (
            <Empty text="No tickets match these filters." />
          )}
          {items.length > 10 && (
            <Pagination page={page} setPage={setPage} total={items.length} />
          )}
        </section>
      )}
    </>
  );
}
function Pagination({ page, setPage, total }) { const pages = Math.ceil(total / 10); return <div className="pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>→</button></div>; }

function Users() { const [items, setItems] = useState([]); const [selected, setSelected] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); async function load() { try { setLoading(true); setItems(getData(await API.get("/admin/users"))); } catch (e) { setError(e.response?.data?.message || e.message); } finally { setLoading(false); } } useEffect(() => { load(); }, []); return <><PageHeader eyebrow="Accounts" title="Users" description="Review account details, balances, and betting activity." action={<button className="secondary-button" onClick={load}>↻ Refresh</button>} />{loading ? <Loading /> : error ? <ErrorState message={error} retry={load} /> : <section className="panel"><div className="table-wrap"><table><thead><tr><th>User</th><th>Identifier</th><th>Status</th><th>Wallet</th><th>Bets</th><th>Bet total</th><th /></tr></thead><tbody>{items.map((user) => <tr key={user.id}><td><strong>{user.fullName}</strong><small>{user.username || "No username"} · #{user.id}</small></td><td><strong>{user.mobile}</strong><small>{user.email}</small></td><td><StatusBadge active={user.role === "ADMIN"} label={user.role} /></td><td>{money(user.Wallet?.balance ?? user.wallet)}</td><td>{user.totalTickets || 0}</td><td>{money(user.totalBetAmount)}</td><td><button className="text-button" onClick={async () => setSelected(getData(await API.get(`/admin/users/${user.id}`)))}>View details →</button></td></tr>)}</tbody></table></div>{items.length === 0 && <Empty text="No users found." />}</section>}{selected && <div className="modal-backdrop"><section className="modal detail-modal"><div className="modal-head"><div><span className="eyebrow">Account #{selected.user.id}</span><h2>{selected.user.fullName}</h2></div><button className="close-button" onClick={() => setSelected(null)}>×</button></div><div className="detail-grid"><div><span>Username</span><strong>{selected.user.username || "-"}</strong></div><div><span>Mobile</span><strong>{selected.user.mobile}</strong></div><div><span>Registered</span><strong>{dateText(selected.user.createdAt)}</strong></div><div><span>Role / status</span><strong>{selected.user.role}</strong></div><div><span>Wallet balance</span><strong>{money(selected.user.Wallet?.balance ?? selected.user.wallet)}</strong></div><div><span>Bet total</span><strong>{money(selected.ticketHistory?.reduce((sum, ticket) => sum + Number(ticket.amount || 0), 0))}</strong></div></div><h3>Winning history and tickets</h3>{selected.ticketHistory?.length ? <div className="mini-list">{selected.ticketHistory.map((ticket) => <div key={ticket.id}><span className="mono">{ticket.ticketNumber}</span><span>{ticket.Lottery?.lotteryName || "Lottery"} · {ticket.status}</span><strong>{money(ticket.winningAmount || ticket.amount)}</strong></div>)}</div> : <Empty text="No ticket history." />}</section></div>}</>; }

function Winners() { const [items, setItems] = useState([]); const [lotteries, setLotteries] = useState([]); const [loading, setLoading] = useState(true); const [notice, setNotice] = useState(""); async function load() { try { setLoading(true); const [winners, lotteryList] = await Promise.all([API.get("/admin/winners"), API.get("/admin/lotteries")]); setItems(getData(winners)); setLotteries(getData(lotteryList)); } catch (e) { setNotice(e.response?.data?.message || e.message); } finally { setLoading(false); } } useEffect(() => { load(); }, []); const winnerIds = new Set(items.map((ticket) => ticket.LotteryId)); async function draw(item) { if (!window.confirm(`Draw a winner for ${item.lotteryName}? This cannot be undone.`)) return; try { const response = await API.post(`/admin/lotteries/${item.id}/draw`, { lotteryId: item.id }); setNotice(`Winner selected: ${response.data?.winnerTicket?.ticketNumber || "success"}`); await load(); } catch (e) { setNotice(e.response?.data?.message || "Unable to draw winner."); } } return <><PageHeader eyebrow="Payouts" title="Winners" description="Review completed draws and select winners for pending lotteries." action={<button className="secondary-button" onClick={load}>↻ Refresh</button>} />{notice && <div className="toast">{notice}</div>}{loading ? <Loading /> : <section className="split-grid"><div className="panel"><div className="panel-heading"><h2>Draw status</h2><span>{lotteries.length} lotteries</span></div>{lotteries.map((item) => { const winner = items.find((ticket) => ticket.LotteryId === item.id); const drawn = item.winnerTicketId || winner; return <div className="winner-row" key={item.id}><div className="winner-mark">{drawn ? "✓" : "○"}</div><div className="winner-copy"><strong>{item.lotteryName}</strong><span>{drawn ? `Winner ticket ${winner?.ticketNumber || `#${item.winnerTicketId}`}` : `Draw date ${dateText(item.drawDate)}`}</span></div>{drawn ? <StatusBadge label="Drawn" /> : <button className="primary-button small-button" onClick={() => draw(item)}>Draw winner</button>}</div>; })}</div><div className="panel"><div className="panel-heading"><h2>Winning tickets</h2><span>{items.length} total</span></div>{items.length ? items.map((ticket) => <div className="winner-row compact" key={ticket.id}><div className="avatar gold">★</div><div className="winner-copy"><strong>{ticket.User?.fullName || `User #${ticket.UserId}`}</strong><span>{ticket.Lottery?.lotteryName} · {ticket.ticketNumber}</span></div><strong className="positive">{money(ticket.winningAmount)}</strong></div>) : <Empty text="No winners recorded." />}</div></section>}</>; }

function Transactions() { const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); async function load() { try { setLoading(true); setItems(getData(await API.get("/admin/transactions"))); } finally { setLoading(false); } } useEffect(() => { load(); }, []); return <><PageHeader eyebrow="Ledger" title="Transactions" description="Wallet deposits, withdrawals, and recorded winnings." action={<button className="secondary-button" onClick={load}>↻ Refresh</button>} />{loading ? <Loading /> : <section className="panel"><div className="table-wrap"><table><thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{items.map((item, index) => <tr key={`${item.type}-${item.User?.id}-${index}`}><td><strong>{item.User?.fullName || `User #${item.User?.id || "-"}`}</strong><small>{item.User?.email || item.User?.mobile || "-"}</small></td><td><span className={`transaction-type ${item.type.toLowerCase()}`}>{item.type}</span></td><td className="amount-cell">{money(item.amount)}</td><td><StatusBadge label={item.status || "Recorded"} /></td><td>{dateText(item.date)}</td></tr>)}</tbody></table></div>{items.length === 0 && <Empty text="No transactions recorded." />}</section>}</>; }

function Reports() { const [dashboard, setDashboard] = useState(null); const [tickets, setTickets] = useState([]); const [lotteries, setLotteries] = useState([]); useEffect(() => { Promise.all([API.get("/admin/dashboard"), API.get("/admin/tickets"), API.get("/admin/lotteries")]).then(([d, t, l]) => { setDashboard(getData(d)); setTickets(getData(t)); setLotteries(getData(l)); }); }, []); if (!dashboard) return <Loading />; const byStatus = tickets.reduce((acc, ticket) => { acc[ticket.status] = (acc[ticket.status] || 0) + 1; return acc; }, {}); return <><PageHeader eyebrow="Insights" title="Reports" description="Summary views calculated from the available Admin API data." /><div className="report-grid"><article className="panel report-card"><span className="eyebrow">Ticket status</span><h2>{tickets.length} tickets</h2>{Object.entries(byStatus).map(([status, count]) => <div className="bar-row" key={status}><span>{status}</span><div><i style={{ width: `${tickets.length ? (count / tickets.length) * 100 : 0}%` }} /></div><strong>{count}</strong></div>)}</article><article className="panel report-card"><span className="eyebrow">Platform totals</span><h2>Financial snapshot</h2><div className="report-stat"><span>Betting amount today</span><strong>{money(dashboard.todaysBettingAmount)}</strong></div><div className="report-stat"><span>Total deposits</span><strong>{money(dashboard.totalDeposits)}</strong></div><div className="report-stat"><span>Total withdrawals</span><strong>{money(dashboard.totalWithdrawals)}</strong></div><div className="report-stat"><span>Total winnings</span><strong>{money(dashboard.totalWinningAmount)}</strong></div></article></div><section className="panel"><div className="panel-heading"><h2>Lottery coverage</h2><span>{lotteries.length} lotteries from API</span></div><div className="coverage-grid">{lotteries.map((lottery) => <div key={lottery.id}><strong>{lottery.lotteryName}</strong><span>{dateText(lottery.drawDate)} · {lottery.winnerTicketId ? "Winner selected" : "Pending draw"}</span></div>)}</div></section></>; }

function NotificationCenter() { const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); async function load() { setLoading(true); try { setItems(getData(await API.get("/admin/notifications"))); } finally { setLoading(false); } } useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []); async function mark(id) { await API.patch(`/admin/notifications/${id}/read`); await load(); } async function markAll() { await API.patch("/admin/notifications/read-all"); await load(); } return <><PageHeader eyebrow="Updates" title="Notifications" description="Real operational events from the platform." action={<button className="secondary-button" onClick={markAll}>Mark all read</button>} />{loading ? <Loading /> : <section className="panel notification-list">{items.length ? items.map((item) => <article className={`notification-item ${item.read ? "read" : "unread"}`} key={item.id}><span className="notification-icon">✦</span><div><strong>{item.title}</strong><p>{item.message}</p><small>{dateText(item.createdAt)} {timeText(item.createdAt)}</small></div>{!item.read && <button className="text-button" onClick={() => mark(item.id)}>Mark read</button>}</article>) : <Empty text="No notifications recorded." />}</section>}</>; }
function Activity() { const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); async function load() { setLoading(true); try { setItems(getData(await API.get("/admin/activity"))); } finally { setLoading(false); } } useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []); return <><PageHeader eyebrow="Audit" title="Activity" description="Traceable admin and platform activity." action={<button className="secondary-button" onClick={load}>↻ Refresh</button>} />{loading ? <Loading /> : <section className="panel activity-timeline full-timeline">{items.length ? items.map((item) => <div key={item.id}><i /> <span><strong>{item.title}</strong>{item.message}<small>{item.action} · {dateText(item.createdAt)} {timeText(item.createdAt)}</small></span></div>) : <Empty text="No activity recorded." />}</section>}</>; }

function App() { return <BrowserRouter><Routes><Route path="/" element={<Navigate to="/login" replace />} /><Route path="/login" element={<Login />} /><Route path="/admin/login" element={<Login />} /><Route path="/admin" element={<Navigate to="/admin/login" replace />} /><Route element={<ProtectedRoute><Shell /></ProtectedRoute>}><Route path="/dashboard" element={<Dashboard />} /><Route path="/lotteries" element={<Lotteries />} />
        <Route path="/lottery-amounts" element={<Navigate to="/lottery-entry-amounts" replace />} /><Route path="/lottery-entry-amounts" element={<LotteryEntryAmounts />} /><Route path="/lottery-games" element={<LotteryGameManager />} /><Route path="/games" element={<ContentManager kind="games" />} /><Route path="/promotions" element={<ContentManager kind="promotions" />} /><Route path="/offers" element={<ContentManager kind="offers" />} /><Route path="/tickets" element={<Tickets />} /><Route path="/users" element={<Users />} /><Route path="/winners" element={<WinnerSelection />} /><Route path="/transactions" element={<Transactions />} /><Route path="/reports" element={<Reports />} /><Route path="/notifications" element={<NotificationCenter />} /><Route path="/activity" element={<Activity />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Route></Routes></BrowserRouter>; }

const root = window.__lotteryAdminRoot || createRoot(document.getElementById("root"));
window.__lotteryAdminRoot = root;
root.render(<React.StrictMode><App /></React.StrictMode>);
