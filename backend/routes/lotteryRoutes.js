const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLottery,
  getLotteries,
  getLotteryById,
  drawWinner,
} = require("../controllers/lotteryController");

// Create Lottery
router.post("/create", authMiddleware, createLottery);

// Get All Lotteries
router.get("/all", getLotteries);

// Get Lottery By ID
router.get("/:id", getLotteryById);

// Draw Winner
router.post("/draw", authMiddleware, drawWinner);

module.exports = router;