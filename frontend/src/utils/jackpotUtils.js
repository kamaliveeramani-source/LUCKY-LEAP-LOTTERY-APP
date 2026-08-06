const POOL_KEY = "jackpot_pool";
const ROUND_KEY = "jackpot_current_round";
const NEXT_DRAW_KEY = "jackpot_next_draw";
const HISTORY_KEY = "jackpot_history";
const PARTICIPANTS_KEY = "jackpot_participants";
const DEFAULT_POOL = 32000000;
const DRAW_SECONDS = 300;
const DEMO_NAMES = [
  "Rahul",
  "Ajay",
  "Priya",
  "Arun",
  "Meena",
  "Neha",
  "Sonal",
  "Vijay",
  "Kavya",
  "Rita",
  "Rohan",
  "Amit",
  "Simran",
  "Sneha",
  "Dev",
  "Sujan",
  "Nisha",
  "Rakesh",
  "Isha",
  "Tanya",
];

export const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return `₹${number.toLocaleString("en-IN")}`;
};

export const getInitialPool = () => {
  const stored = window.localStorage.getItem(POOL_KEY);
  return stored && !Number.isNaN(Number(stored)) ? Number(stored) : DEFAULT_POOL;
};

export const savePool = (pool) => {
  window.localStorage.setItem(POOL_KEY, String(Math.max(0, Number(pool) || 0)));
};

export const getCurrentRound = () => {
  return window.localStorage.getItem(ROUND_KEY) || `ROUND-${String(Date.now()).slice(-8)}`;
};

export const saveCurrentRound = (roundId) => {
  window.localStorage.setItem(ROUND_KEY, String(roundId));
};

export const getNextDrawAt = () => {
  const stored = Number(window.localStorage.getItem(NEXT_DRAW_KEY));
  if (stored && !Number.isNaN(stored)) {
    return stored;
  }
  const next = Date.now() + DRAW_SECONDS * 1000;
  saveNextDrawAt(next);
  return next;
};

export const saveNextDrawAt = (timestamp) => {
  window.localStorage.setItem(NEXT_DRAW_KEY, String(timestamp));
};

export const getTimeRemaining = (targetTimestamp) => {
  const remaining = Math.ceil((targetTimestamp - Date.now()) / 1000);
  return Math.max(0, remaining);
};

export const loadHistory = () => {
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history) => {
  try {
    const sanitized = Array.isArray(history) ? history.slice(0, 50) : [];
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sanitized));
  } catch {
    // ignore
  }
};

export const getLastWinner = () => {
  const history = loadHistory();
  if (!history.length) return null;
  const last = history[0];
  return `${last.winnerName} • ${formatCurrency(last.prize)}`;
};

export const loadParticipants = () => {
  try {
    const stored = window.localStorage.getItem(PARTICIPANTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveParticipants = (participants) => {
  try {
    window.localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
  } catch {
    // ignore
  }
};

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

export const randomRound = () => {
  const date = new Date();
  const slug = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `ROUND-${slug}-${suffix}`;
};

export const createDemoParticipants = (count = 8) => {
  const names = shuffle(DEMO_NAMES).slice(0, count).map((name, index) => ({
    id: `demo-${name.toLowerCase()}-${index}`,
    name,
    isUser: false,
  }));
  return names;
};

export const addUserParticipant = (participants) => {
  const existing = participants.find((item) => item.isUser);
  if (existing) return participants;
  return [{ id: "you", name: "You", isUser: true }, ...participants];
};

export const addRandomParticipants = (participants, count = 2) => {
  const available = DEMO_NAMES.filter((name) => !participants.some((item) => item.name === name));
  const batch = shuffle(available).slice(0, Math.min(count, available.length));
  const next = batch.map((name, index) => ({
    id: `demo-${name.toLowerCase()}-${Date.now()}-${index}`,
    name,
    isUser: false,
  }));
  return [...participants, ...next];
};

export const formatRoundLabel = (roundId) => roundId || "ROUND-0000";

export const formatDrawTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const getDefaultPool = () => DEFAULT_POOL;
export const getDrawSeconds = () => DRAW_SECONDS;
