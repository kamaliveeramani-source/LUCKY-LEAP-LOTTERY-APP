const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLottery,
  getLotteries,
  drawWinner
} = require("../controllers/lotteryController");

// Create Lottery
router.post("/create", authMiddleware, createLottery);

// Get All Lotteries
router.get("/all", getLotteries);

// Draw Winner
router.post("/draw", authMiddleware, drawWinner);

module.exports = router;