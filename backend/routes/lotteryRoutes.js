const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const { createLottery, getLotteries, getLotteryById } = require("../controllers/lotteryController");
const { declareWinningResults } = require("../controllers/winningResultController");
const {
  getLotteryEntryAmounts,
  placeLotteryEntries,
} = require("../controllers/lotteryEntryAmountController");
const lotteryGameConfigs = require("../controllers/lotteryGameConfigController");

// Create Lottery
router.post("/create", requireAdmin, createLottery);

// Get All Lotteries
router.get("/all", getLotteries);
router.get("/games", lotteryGameConfigs.listPublic);
router.get("/entry-amounts", getLotteryEntryAmounts);
router.post("/entries", authMiddleware, placeLotteryEntries);

// Get Lottery By ID
router.get("/:id", getLotteryById);

// Draw Winner
router.post("/draw", requireAdmin, declareWinningResults);

module.exports = router;