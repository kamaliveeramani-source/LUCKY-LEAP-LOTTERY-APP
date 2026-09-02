const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const admin = require("../controllers/adminController");

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

module.exports = router;