const Lottery = require("../models/Lottery");
const { safeRecordActivity } = require("./operationalEvents");
const { getNextDraw } = require("../utils/drawStatus");

const CHECK_INTERVAL_MS = 60 * 1000;
const REMINDER_WINDOW_MS = 30 * 60 * 1000;

function formatDrawTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
}

// Fires one deduped admin notification per draw, exactly within the 30-minute-before window.
async function checkUpcomingDraws() {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

    const lotteries = await Lottery.findAll({ where: { isActive: true } });

    for (const lottery of lotteries) {
      const nextDraw = getNextDraw(lottery, now);
      if (!nextDraw || nextDraw > windowEnd) continue;
      await safeRecordActivity({
        action: "DRAW_REMINDER",
        title: "Draw in 30 minutes",
        message: `${lottery.lotteryName} result is due at ${formatDrawTime(nextDraw)}. Please update the winning numbers after the draw.`,
        LotteryId: lottery.id,
        eventKey: `draw-reminder-30:${lottery.id}:${nextDraw.toISOString()}`,
      });
    }
  } catch (error) {
    console.error("Draw reminder scheduler error:", error.message);
  }
}

function startDrawReminderScheduler() {
  checkUpcomingDraws();
  const timer = setInterval(checkUpcomingDraws, CHECK_INTERVAL_MS);
  return () => clearInterval(timer);
}

module.exports = { startDrawReminderScheduler, checkUpcomingDraws };
