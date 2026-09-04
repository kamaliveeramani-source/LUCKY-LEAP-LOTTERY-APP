const Notification = require("../models/Notification");

exports.listMine = async (req, res) => {
  const items = await Notification.findAll({ where: { UserId: req.user.userId }, order: [["createdAt", "DESC"]], limit: 100 });
  return res.json({ success: true, data: items });
};

exports.markMineRead = async (req, res) => {
  const [updated] = await Notification.update({ read: true }, { where: { id: Number(req.params.id), UserId: req.user.userId } });
  if (!updated) return res.status(404).json({ success: false, message: "Notification not found" });
  return res.json({ success: true });
};

exports.markAllMineRead = async (req, res) => {
  await Notification.update({ read: true }, { where: { UserId: req.user.userId, read: false } });
  return res.json({ success: true });
};
