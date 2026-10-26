const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const yaml = fs.readFileSync(path.resolve(__dirname, "../../render.yaml"), "utf8");
const services = yaml.split(/^ {2}- type: /m).slice(1).map((block) => ({
  type: block.split("\n")[0].trim(),
  name: block.match(/name: (.+)/)[1].trim(),
  block,
}));

const BACKEND_URL = "https://lucky-leap-lottery-app-dm38.onrender.com";
const FRONTEND_ORIGIN = "https://thumbi-lotteries-frontend-ugbv.onrender.com";
const ADMIN_ORIGIN = "https://thumbi-lotteries-admin.onrender.com";

test("both static sites rewrite every path to /index.html for client-side routing", () => {
  const sites = services.filter((service) => service.type === "static_site");
  assert.equal(sites.length, 2);
  for (const site of sites) {
    assert.match(site.block, /staticPublishPath: dist/);
    assert.match(site.block, /type: rewrite\s+source: \/\*\s+destination: \/index\.html/);
  }
});

test("static sites build the correct root directories against the deployed backend", () => {
  const frontend = services.find((service) => service.name === "thumbi-lotteries-frontend");
  const admin = services.find((service) => service.name === "thumbi-lotteries-admin");
  assert.match(frontend.block, /rootDir: frontend/);
  assert.match(admin.block, /rootDir: admin/);
  for (const site of [frontend, admin]) {
    assert.match(site.block, new RegExp(`key: VITE_API_URL\\s+value: ${BACKEND_URL}\\s`));
  }
});

test("backend allows the deployed frontend and admin origins and exposes a health check", () => {
  const backend = services.find((service) => service.type === "web");
  assert.match(backend.block, /healthCheckPath: \/health/);
  const allowed = backend.block.match(/key: ALLOWED_ORIGINS\s+value: (.+)/)[1].split(",");
  assert.ok(allowed.includes(FRONTEND_ORIGIN));
  assert.ok(allowed.includes(ADMIN_ORIGIN));
});

test("secrets are never committed to render.yaml", () => {
  for (const key of ["DATABASE_URL", "JWT_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD"]) {
    assert.match(yaml, new RegExp(`key: ${key}\\s+sync: false`));
  }
});
