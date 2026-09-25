const { Op } = require("sequelize");
const Lottery = require("../models/Lottery");
const { safeRecordActivity } = require("./operationalEvents");

const CHECK_INTERVAL_MS = 60 * 1000;
const REMINDER_WINDOW_MS = 30 * 60 * 1000;

function formatDrawTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// Fires one deduped admin notification per draw, exactly within the 30-minute-before window.
async function checkUpcomingDraws() {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

    const dueLotteries = await Lottery.findAll({
      where: {
        isActive: true,
        drawStatus: { [Op.ne]: "COMPLETED" },
        drawDate: { [Op.gt]: now, [Op.lte]: windowEnd },
      },
    });

    for (const lottery of dueLotteries) {
      await safeRecordActivity({
        action: "DRAW_REMINDER",
        title: "Draw in 30 minutes",
        message: `${lottery.lotteryName} result is due at ${formatDrawTime(lottery.drawDate)}. Please update the winning numbers after the draw.`,
        LotteryId: lottery.id,
        eventKey: `draw-reminder-30:${lottery.id}`,
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
