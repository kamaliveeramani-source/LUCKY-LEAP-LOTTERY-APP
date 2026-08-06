const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getWallet,
  addMoney,
  withdrawMoney,
  transferMoney
} = require("../controllers/walletController");

// Get Wallet Balance
router.get("/balance", authMiddleware, getWallet);

// Add Money
router.post("/add", authMiddleware, addMoney);

// Withdraw Money
router.post("/withdraw", authMiddleware, withdrawMoney);

// Transfer Money
router.post("/transfer", authMiddleware, transferMoney);

module.exports = router;