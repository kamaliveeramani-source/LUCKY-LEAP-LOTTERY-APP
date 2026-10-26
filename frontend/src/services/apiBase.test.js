import test from "node:test";
import assert from "node:assert/strict";
import { buildApiBaseUrl } from "./apiBase.js";

test("defaults to the dev proxy path", () => {
  assert.equal(buildApiBaseUrl(undefined), "/api");
  assert.equal(buildApiBaseUrl(""), "/api");
});

test("appends /api to a bare backend origin", () => {
  assert.equal(
    buildApiBaseUrl("https://lucky-leap-lottery-app-dm38.onrender.com"),
    "https://lucky-leap-lottery-app-dm38.onrender.com/api"
  );
});

test("never produces /api/api", () => {
  const expected = "https://lucky-leap-lottery-app-dm38.onrender.com/api";
  assert.equal(buildApiBaseUrl("https://lucky-leap-lottery-app-dm38.onrender.com/api"), expected);
  assert.equal(buildApiBaseUrl("https://lucky-leap-lottery-app-dm38.onrender.com/"), expected);
  assert.equal(buildApiBaseUrl("https://lucky-leap-lottery-app-dm38.onrender.com/api/"), expected);
});
