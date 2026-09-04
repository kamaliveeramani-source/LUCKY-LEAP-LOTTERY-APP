const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

async function recordActivity({ action, title, message, actorUserId = null, UserId = null, LotteryId = null, TicketId = null, notifyUser = false, eventKey = null }) {
  const activity = eventKey ? await ActivityLog.findOrCreate({ where: { action, message }, defaults: { title, actorUserId, UserId, LotteryId, TicketId } }).then(([item]) => item) : await ActivityLog.create({ action, title, message, actorUserId, UserId, LotteryId, TicketId });
  const adminKey = eventKey ? `admin:${eventKey}` : null;
  if (adminKey && !(await Notification.findOne({ where: { eventKey: adminKey } }))) {
    await Notification.create({ title, message, LotteryId, TicketId, actorUserId, eventKey: adminKey });
  }
  if (notifyUser && UserId) {
    const userKey = eventKey ? `user:${UserId}:${eventKey}` : null;
    if (!userKey || !(await Notification.findOne({ where: { eventKey: userKey } }))) await Notification.create({ title, message, UserId, LotteryId, TicketId, actorUserId, eventKey: userKey });
  }
  return activity;
}

async function safeRecordActivity(event) {
  try { return await recordActivity(event); } catch (error) { console.error("Operational event error:", error.message); return null; }
}

module.exports = { recordActivity, safeRecordActivity };
