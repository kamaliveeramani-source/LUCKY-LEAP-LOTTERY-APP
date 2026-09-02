const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
  createLottery,
  getLotteries,
  getLotteryById,
  drawWinner,
} = require("../controllers/lotteryController");

// Create Lottery
router.post("/create", requireAdmin, createLottery);

// Get All Lotteries
router.get("/all", getLotteries);

// Get Lottery By ID
router.get("/:id", getLotteryById);

// Draw Winner
router.post("/draw", requireAdmin, drawWinner);

module.exports = router;