const test = require("node:test");
const assert = require("node:assert/strict");

// Test the origin resolution logic
function normalizeOrigin(origin) {
  if (typeof origin !== "string") return "";
  return origin.trim().replace(/\/+$/, "");
}

const rawAllowedOrigins = [
  "https://thumbi-lotteries-frontend-ugbv.onrender.com",
  "https://thumbi-lotteries-frontend-rhav.onrender.com",
  "https://thumbi-lotteries-admin.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5177",
].map(normalizeOrigin);

const allowedOrigins = new Set(rawAllowedOrigins);

function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;

  try {
    const url = new URL(normalized);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return true;
    }
    if (
      url.hostname.endsWith(".onrender.com") &&
      (url.hostname.startsWith("thumbi-lotteries-") || url.hostname.startsWith("lucky-leap-"))
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

test("production frontend origin is allowed", () => {
  assert.equal(isOriginAllowed("https://thumbi-lotteries-frontend-ugbv.onrender.com"), true);
  assert.equal(isOriginAllowed("https://thumbi-lotteries-frontend-ugbv.onrender.com/"), true);
});

test("legacy frontend and admin origins are allowed", () => {
  assert.equal(isOriginAllowed("https://thumbi-lotteries-frontend-rhav.onrender.com"), true);
  assert.equal(isOriginAllowed("https://thumbi-lotteries-admin.onrender.com"), true);
});

test("render preview subdomains for thumbi-lotteries are allowed", () => {
  assert.equal(isOriginAllowed("https://thumbi-lotteries-frontend-pr-12.onrender.com"), true);
});

test("localhost origins are allowed", () => {
  assert.equal(isOriginAllowed("http://localhost:5173"), true);
  assert.equal(isOriginAllowed("http://127.0.0.1:5173"), true);
  assert.equal(isOriginAllowed("http://localhost:8080"), true);
});

test("requests without origin header (server-to-server, curl) are allowed", () => {
  assert.equal(isOriginAllowed(undefined), true);
  assert.equal(isOriginAllowed(null), true);
  assert.equal(isOriginAllowed(""), true);
});

test("unauthorized third-party origins are blocked", () => {
  assert.equal(isOriginAllowed("https://malicious-site.com"), false);
  assert.equal(isOriginAllowed("https://evil-onrender.com"), false);
  assert.equal(isOriginAllowed("https://otherapp.onrender.com"), false);
});

test("express cors middleware handles preflight OPTIONS request with HTTP 204", async () => {
  const express = require("express");
  const cors = require("cors");
  const app = express();

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  app.get("/api/lottery/all", (req, res) => res.json({ success: true, data: [] }));
  app.post("/api/auth/login", (req, res) => res.json({ success: true }));

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const preflight = await fetch(`http://127.0.0.1:${port}/api/lottery/all`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://thumbi-lotteries-frontend-ugbv.onrender.com",
        "Access-Control-Request-Method": "GET",
      },
    });

    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get("access-control-allow-origin"),
      "https://thumbi-lotteries-frontend-ugbv.onrender.com"
    );
    assert.equal(preflight.headers.get("access-control-allow-credentials"), "true");

    const loginPreflight = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://thumbi-lotteries-frontend-ugbv.onrender.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    assert.equal(loginPreflight.status, 204);
    assert.equal(
      loginPreflight.headers.get("access-control-allow-origin"),
      "https://thumbi-lotteries-frontend-ugbv.onrender.com"
    );
    assert.equal(loginPreflight.headers.get("access-control-allow-credentials"), "true");
  } finally {
    server.close();
  }
});
