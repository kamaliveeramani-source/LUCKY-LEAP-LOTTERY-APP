const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

process.env.JWT_SECRET = "test-secret-not-for-production";

const calls = { where: [] };
let storedUser = null;

function stub(relativePath, exports) {
  const resolved = require.resolve(relativePath);
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
}

stub("../models/User", {
  scope: () => ({
    findOne: async ({ where }) => {
      calls.where.push(where);
      return storedUser;
    },
  }),
});
stub("../services/operationalEvents", { safeRecordActivity: async () => {} });
stub("../controllers/referralController", { applyReferralToUserIfNeeded: async () => {} });

const { login } = require("../controllers/authController");

function run(body) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload }); return this; },
    };
    login({ body }, res);
  });
}

async function makeUser(overrides = {}) {
  return {
    id: 7,
    role: "USER",
    mobile: "9876543210",
    username: null,
    password: await bcrypt.hash("correct-horse", 4),
    toJSON() { const { password, ...rest } = this; return rest; },
    ...overrides,
  };
}

test("rejects a request without a password", async () => {
  const result = await run({ mobile: "9876543210" });
  assert.equal(result.status, 400);
});

test("rejects non-string identifiers instead of throwing", async () => {
  const result = await run({ mobile: { $ne: "" }, password: "x" });
  assert.equal(result.status, 400);
});

test("player login looks up by mobile and returns a token without the password hash", async () => {
  storedUser = await makeUser();
  calls.where.length = 0;
  const result = await run({ mobile: " 9876543210 ", password: "correct-horse" });

  assert.equal(result.status, 200);
  assert.equal(typeof result.body.token, "string");
  assert.equal(JSON.parse(JSON.stringify(result.body)).data.password, undefined);
  assert.deepEqual(calls.where[0], { mobile: "9876543210" });
});

test("admin login is restricted to ADMIN role records", async () => {
  storedUser = await makeUser({ role: "ADMIN", username: "boss" });
  calls.where.length = 0;
  const result = await run({ username: "boss", password: "correct-horse" });

  assert.equal(result.status, 200);
  assert.equal(calls.where[0].role, "ADMIN");
});

test("unknown account and wrong password both return the same 401 and never log secrets", async () => {
  const logged = [];
  const originalWarn = console.warn;
  console.warn = (...args) => logged.push(args.join(" "));

  try {
    storedUser = null;
    const missing = await run({ mobile: "1234567891", password: "hunter2-secret" });

    storedUser = await makeUser();
    const wrong = await run({ mobile: "9876543210", password: "hunter2-secret" });

    assert.equal(missing.status, 401);
    assert.equal(wrong.status, 401);
    assert.deepEqual(missing.body, wrong.body);
    assert.match(logged[0], /reason=user_not_found/);
    assert.match(logged[1], /reason=password_mismatch/);
    for (const line of logged) {
      assert.doesNotMatch(line, /hunter2-secret|1234567891|9876543210/);
    }
  } finally {
    console.warn = originalWarn;
  }
});
