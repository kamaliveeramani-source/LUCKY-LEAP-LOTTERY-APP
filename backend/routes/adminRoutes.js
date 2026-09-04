const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const admin = require("../controllers/adminController");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();
router.use(requireAdmin);

router.get("/dashboard", admin.getDashboard);
router.get("/lotteries", admin.listLotteries);
router.post("/lotteries", admin.createLottery);
router.get("/lotteries/:id", admin.getLottery);
router.put("/lotteries/:id", admin.updateLottery);
router.patch("/lotteries/:id/status", admin.updateLotteryStatus);
router.get("/tickets", admin.listTickets);
router.get("/tickets/:id", admin.getTicket);
router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);
router.get("/winners", admin.listWinners);
router.post("/lotteries/:id/draw", admin.drawLottery);
router.get("/transactions", admin.listTransactions);
router.get("/notifications", async (req, res) => res.json({ success: true, data: await Notification.findAll({ order: [["createdAt", "DESC"]], limit: 100 }) }));
router.patch("/notifications/:id/read", async (req, res) => { await Notification.update({ read: true }, { where: { id: Number(req.params.id) } }); return res.json({ success: true }); });
router.patch("/notifications/read-all", async (req, res) => { await Notification.update({ read: true }, { where: { read: false } }); return res.json({ success: true }); });
router.get("/activity", async (req, res) => res.json({ success: true, data: await ActivityLog.findAll({ order: [["createdAt", "DESC"]], limit: 100 }) }));

module.exports = router;