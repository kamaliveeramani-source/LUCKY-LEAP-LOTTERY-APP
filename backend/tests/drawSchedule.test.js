const test = require("node:test");
const assert = require("node:assert/strict");
const { getNextDraw, parseISTDateTime } = require("../utils/drawStatus");

const at = (value) => new Date(value);
const iso = (value) => getNextDraw(value.lottery, at(value.now))?.toISOString() || null;

test("daily schedules select today's draw when it is still upcoming", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "DAILY", drawTime: "13:00" },
    now: "2026-10-03T06:30:00Z",
  }), "2026-10-03T07:30:00.000Z");
});

test("daily schedules roll to tomorrow after today's draw time", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "DAILY", drawTime: "13:00" },
    now: "2026-10-03T08:30:00Z",
  }), "2026-10-04T07:30:00.000Z");
});

test("configured evening times remain distinct per lottery", () => {
  const now = "2026-10-03T06:30:00Z";
  assert.equal(iso({ lottery: { drawFrequency: "DAILY", drawTime: "15:00" }, now }), "2026-10-03T09:30:00.000Z");
  assert.equal(iso({ lottery: { drawFrequency: "DAILY", drawTime: "18:00" }, now: "2026-10-03T11:30:00Z" }), "2026-10-03T12:30:00.000Z");
  assert.equal(iso({ lottery: { drawFrequency: "DAILY", drawTime: "18:30" }, now }), "2026-10-03T13:00:00.000Z");
  assert.equal(iso({ lottery: { drawFrequency: "DAILY", drawTime: "20:00" }, now }), "2026-10-03T14:30:00.000Z");
});

test("weekly schedules select the next configured weekday", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "WEEKLY", drawDayOfWeek: 1, drawTime: "18:30" },
    now: "2026-10-03T06:30:00Z",
  }), "2026-10-05T13:00:00.000Z");
});

test("a weekly draw today rolls to next week once its time has passed", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "WEEKLY", drawDayOfWeek: 6, drawTime: "13:00" },
    now: "2026-10-03T08:30:00Z",
  }), "2026-10-10T07:30:00.000Z");
});

test("specific dates return only a future saved occurrence", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "SPECIFIC_DATE", drawDate: "2026-10-04T12:30:00Z" },
    now: "2026-10-03T06:30:00Z",
  }), "2026-10-04T12:30:00.000Z");
  assert.equal(iso({
    lottery: { drawFrequency: "SPECIFIC_DATE", drawDate: "2026-10-02T12:30:00Z" },
    now: "2026-10-03T06:30:00Z",
  }), null);
});

test("legacy daily rows reuse the time in their saved drawDate", () => {
  assert.equal(iso({
    lottery: { drawFrequency: "DAILY", drawDate: "2026-10-03T07:30:00Z" },
    now: "2026-10-03T08:30:00Z",
  }), "2026-10-04T07:30:00.000Z");
});

test("invalid recurring schedule values do not generate a draw", () => {
  assert.equal(getNextDraw({ drawFrequency: "WEEKLY", drawDayOfWeek: 8, drawTime: "13:00" }, at("2026-10-03T06:30:00Z")), null);
  assert.equal(getNextDraw({ drawFrequency: "WEEKLY", drawDayOfWeek: "", drawTime: "13:00" }, at("2026-10-03T06:30:00Z")), null);
  assert.equal(getNextDraw({ drawFrequency: "DAILY", drawTime: "25:00" }, at("2026-10-03T06:30:00Z")), null);
  assert.equal(parseISTDateTime("2026-02-30", "18:00"), null);
});

test("withComputedStatus preserves valid drawDate and computes nextDrawDate in IST", () => {
  const { withComputedStatus } = require("../utils/drawStatus");
  const lottery = {
    id: 1,
    lotteryName: "Kerala Lottery",
    drawFrequency: "DAILY",
    drawTime: "13:00",
    drawDate: "2026-10-03T07:30:00.000Z",
  };
  const computed = withComputedStatus(lottery, new Date("2026-10-03T06:00:00.000Z"));
  assert.equal(computed.drawStatus, "UPCOMING");
  assert.equal(computed.nextDrawDate, "2026-10-03T07:30:00.000Z");
  assert.equal(computed.drawDate, "2026-10-03T07:30:00.000Z");
});

test("withComputedStatus rolls nextDrawDate to next day after draw time while keeping valid dates", () => {
  const { withComputedStatus } = require("../utils/drawStatus");
  const lottery = {
    id: 2,
    lotteryName: "Win Win",
    drawFrequency: "DAILY",
    drawTime: "18:00",
    drawDate: "2026-10-03T12:30:00.000Z",
  };
  const computed = withComputedStatus(lottery, new Date("2026-10-03T13:00:00.000Z"));
  // In IST, 18:00 on Oct 3 has passed at 18:30 IST (13:00 UTC), so next draw is Oct 4 18:00 IST (12:30 UTC)
  assert.equal(computed.nextDrawDate, "2026-10-04T12:30:00.000Z");
  assert.equal(computed.drawDate, "2026-10-03T12:30:00.000Z");
});