const sequelize = require("../config/database");
const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const LotteryEntryAmount = require("../models/LotteryEntryAmount");
const { safeRecordActivity } = require("../services/operationalEvents");

const BET_TYPES = {
  SINGLE: { amountKey: "singleDigitAmount", digits: 1 },
  DOUBLE: { amountKey: "doubleDigitAmount", digits: 2 },
  TRIPLE: { amountKey: "tripleDigitAmount", digits: 3 },
};

function parseAmount(value, label) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return { error: `${label} is required` };
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return { error: `${label} must be a valid number` };
  }
  if (amount < 0) {
    return { error: `${label} cannot be negative` };
  }
  if (amount <= 0) {
    return { error: `${label} must be greater than 0` };
  }
  return { amount: Number(amount.toFixed(2)) };
}

function publicAmounts(record) {
  return LotteryEntryAmount.toPublic(record);
}

exports.getLotteryEntryAmounts = async (req, res) => {
  try {
    const record = await LotteryEntryAmount.getConfig();
    return res.json({ success: true, data: publicAmounts(record) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLotteryEntryAmounts = async (req, res) => {
  try {
    const single = parseAmount(req.body?.singleDigitAmount, "Single Digit entry amount");
    const double = parseAmount(req.body?.doubleDigitAmount, "Double Digit entry amount");
    const triple = parseAmount(req.body?.tripleDigitAmount, "Triple Digit entry amount");
    const singleWinning = parseAmount(req.body?.singleDigitWinningAmount, "Single Digit winning amount");
    const doubleWinning = parseAmount(req.body?.doubleDigitWinningAmount, "Double Digit winning amount");
    const tripleWinning = parseAmount(req.body?.tripleDigitWinningAmount, "Triple Digit winning amount");
    const firstError = single.error || double.error || triple.error || singleWinning.error || doubleWinning.error || tripleWinning.error;
    if (firstError) {
      return res.status(400).json({ success: false, message: firstError });
    }

    const record = await LotteryEntryAmount.getConfig();
    await record.update({
      singleDigitAmount: single.amount,
      doubleDigitAmount: double.amount,
      tripleDigitAmount: triple.amount,
      singleDigitWinningAmount: singleWinning.amount,
      doubleDigitWinningAmount: doubleWinning.amount,
      tripleDigitWinningAmount: tripleWinning.amount,
    });

    return res.json({
      success: true,
      message: "Lottery entry amounts saved",
      data: publicAmounts(record),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

function ticketNumber() {
  return `LT${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`;
}

exports.placeLotteryEntries = async (req, res) => {
  let transaction;
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const lotteryId = Number(req.body?.lotteryId || req.params.id);
    const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
    if (!Number.isInteger(lotteryId) || lotteryId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid lotteryId" });
    }
    if (!entries.length) {
      return res.status(400).json({ success: false, message: "Add at least one lottery entry first." });
    }

    const lottery = await Lottery.findByPk(lotteryId);
    if (!lottery) {
      return res.status(404).json({ success: false, message: "Lottery not found" });
    }
    if (!lottery.isActive) {
      return res.status(400).json({ success: false, message: "Lottery is inactive" });
    }

    const config = publicAmounts(await LotteryEntryAmount.getConfig());
    const normalized = [];
    for (const entry of entries) {
      const betType = String(entry?.betType || "").trim().toUpperCase();
      const spec = BET_TYPES[betType];
      if (!spec) {
        return res.status(400).json({ success: false, message: "betType must be SINGLE, DOUBLE or TRIPLE" });
      }
      const selectedNumber = String(entry?.selectedNumber ?? "").trim();
      if (!new RegExp(`^\\d{${spec.digits}}$`).test(selectedNumber)) {
        return res.status(400).json({ success: false, message: `${betType} requires exactly ${spec.digits} digit(s)` });
      }
      const quantity = Number(entry?.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive whole number" });
      }
      const unitAmount = Number(config[spec.amountKey]);
      normalized.push({
        betType,
        selectedNumber,
        quantity,
        amount: Number((unitAmount * quantity).toFixed(2)),
      });
    }

    const required = Number(normalized.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2));
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    transaction = await sequelize.transaction();
    const wallet = await Wallet.findOne({
      where: { UserId: user.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const balance = Number(wallet?.balance || 0);
    if (!wallet || balance < required) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance. Please add cash to continue.",
        balance,
        required,
      });
    }

    wallet.balance = Number((balance - required).toFixed(2));
    wallet.todaysBets = Number(wallet.todaysBets || 0) + normalized.length;
    await wallet.save({ transaction });
    const tickets = [];
    for (const entry of normalized) {
      const ticket = await Ticket.create({
        ticketNumber: ticketNumber(),
        betType: entry.betType,
        selectedNumber: entry.selectedNumber,
        amount: entry.amount,
        winningAmount: 0,
        status: "PENDING",
        UserId: user.id,
        LotteryId: lottery.id,
      }, { transaction });
      tickets.push(ticket);
    }

    await transaction.commit();
    transaction = null;

    const updatedWallet = await Wallet.findOne({ where: { UserId: user.id } });
    await safeRecordActivity({
      action: "TICKET_PURCHASED",
      title: "Lottery entries placed",
      message: `${user.fullName} placed ${tickets.length} lottery ${tickets.length === 1 ? "entry" : "entries"}.`,
      UserId: user.id,
      LotteryId: lottery.id,
      TicketId: tickets[0]?.id,
      eventKey: `lottery-entries:${lottery.id}:${tickets[0]?.id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Lottery entries placed successfully",
      data: {
        tickets,
        requiredWalletBalance: required,
        walletBalance: Number(updatedWallet.balance),
      },
    });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch (_) { /* ignore */ }
    }
    return res.status(/insufficient wallet balance/i.test(error.message || "") ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};
