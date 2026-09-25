const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WinningResult = require("../models/WinningResult");
const { safeRecordActivity } = require("../services/operationalEvents");
const { computeDrawStatus, withComputedStatus } = require("../utils/drawStatus");

const BET_TYPES = ["SINGLE", "DOUBLE", "TRIPLE"];
const BET_LENGTHS = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3 };

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeResults(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw httpError(400, "winningResults must contain at least one result");
  }

  const seen = new Set();
  return input.map((item) => {
    const betType = String(item?.betType || "").trim().toUpperCase();
    const winningNumber = String(item?.winningNumber ?? "").trim();
    const prizeAmount = Number(item?.prizeAmount);

    if (!BET_TYPES.includes(betType)) {
      throw httpError(400, "betType must be SINGLE, DOUBLE or TRIPLE");
    }
    if (seen.has(betType)) {
      throw httpError(400, `Duplicate winning result for ${betType}`);
    }
    if (!new RegExp(`^\\d{${BET_LENGTHS[betType]}}$`).test(winningNumber)) {
      throw httpError(400, `${betType} requires exactly ${BET_LENGTHS[betType]} digit(s)`);
    }
    if (!Number.isFinite(prizeAmount) || prizeAmount <= 0) {
      throw httpError(400, `Prize amount for ${betType} must be greater than 0`);
    }

    seen.add(betType);
    return { betType, winningNumber, prizeAmount: Number(prizeAmount.toFixed(2)) };
  });
}

async function findLotteryOrThrow(id, options = {}) {
  const lottery = await Lottery.findByPk(Number(id), options);
  if (!lottery) throw httpError(404, "Lottery not found");
  return lottery;
}

async function loadApplicableBetTypes(lotteryId) {
  const tickets = await Ticket.findAll({
    where: { LotteryId: lotteryId },
    attributes: ["betType"],
    group: ["betType"],
  });
  return [...new Set([...BET_TYPES, ...tickets.map((ticket) => ticket.betType)])];
}

async function saveConfiguredResults(lottery, results, transaction) {
  for (const result of results) {
    const existing = await WinningResult.findOne({
      where: { LotteryId: lottery.id, betType: result.betType },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existing) {
      await existing.update({ ...result, status: "CONFIGURED" }, { transaction });
    } else {
      await WinningResult.create({ LotteryId: lottery.id, ...result, status: "CONFIGURED" }, { transaction });
    }
  }
}

exports.getWinningResults = async (req, res) => {
  try {
    const lottery = await findLotteryOrThrow(req.params.id);
    const [results, betTypes] = await Promise.all([
      WinningResult.findAll({ where: { LotteryId: lottery.id }, order: [["id", "ASC"]] }),
      loadApplicableBetTypes(lottery.id),
    ]);
    return res.json({ success: true, data: { lottery: withComputedStatus(lottery), results, betTypes } });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.saveWinningResults = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const lottery = await findLotteryOrThrow(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (computeDrawStatus(lottery) === "UPCOMING") throw httpError(400, "Winning result submission is locked until after draw time");
    if (computeDrawStatus(lottery) === "COMPLETED") throw httpError(409, "This draw has already been settled");
    const results = normalizeResults(req.body?.winningResults || req.body?.results);
    await saveConfiguredResults(lottery, results, transaction);
    await transaction.commit();
    return res.json({ success: true, message: "Winning results saved", data: results });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.declareWinningResults = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const lottery = await findLotteryOrThrow(req.params.id || req.body?.lotteryId, { transaction, lock: transaction.LOCK.UPDATE });
    if (computeDrawStatus(lottery) === "COMPLETED") throw httpError(409, "This draw has already been settled");
    if (computeDrawStatus(lottery) === "UPCOMING") throw httpError(400, "Winning result declaration is locked until after draw time");

    const results = normalizeResults(req.body?.winningResults || req.body?.results);
    await saveConfiguredResults(lottery, results, transaction);
    const resultMap = new Map(results.map((result) => [`${result.betType}:${result.winningNumber}`, result]));
    const tickets = await Ticket.findAll({
      where: { LotteryId: lottery.id, status: "PENDING" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const applicableBetTypes = [...new Set(tickets.map((ticket) => ticket.betType))];
    const missingBetTypes = applicableBetTypes.filter((betType) => !results.some((result) => result.betType === betType));
    if (missingBetTypes.length > 0) {
      throw httpError(400, `Winning results are required for: ${missingBetTypes.join(", ")}`);
    }
    const payouts = new Map();
    let firstWinningTicketId = null;

    for (const ticket of tickets) {
      const result = resultMap.get(`${ticket.betType}:${ticket.selectedNumber}`);
      if (result) {
        ticket.status = "WON";
        ticket.winningAmount = result.prizeAmount;
        payouts.set(ticket.UserId, (payouts.get(ticket.UserId) || 0) + result.prizeAmount);
        if (!firstWinningTicketId) firstWinningTicketId = ticket.id;
      } else {
        ticket.status = "LOST";
        ticket.winningAmount = 0;
      }
      await ticket.save({ transaction });
    }

    for (const [userId, amount] of payouts) {
      let wallet = await Wallet.findOne({ where: { UserId: userId }, transaction, lock: transaction.LOCK.UPDATE });
      if (!wallet) {
        const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!user) throw httpError(500, `User ${userId} was not found during payout`);
        wallet = await Wallet.create({ UserId: userId, balance: Number(user.wallet) || 0 }, { transaction });
      }
      wallet.balance = Number((Number(wallet.balance || 0) + amount).toFixed(2));
      wallet.winning = Number((Number(wallet.winning || 0) + amount).toFixed(2));
      wallet.totalWinning = Number((Number(wallet.totalWinning || 0) + amount).toFixed(2));
      await wallet.save({ transaction });
      await User.update({ wallet: wallet.balance }, { where: { id: userId }, transaction });
    }

    await WinningResult.update({ status: "DECLARED" }, { where: { LotteryId: lottery.id }, transaction });
    lottery.winnerTicketId = firstWinningTicketId;
    lottery.drawStatus = "COMPLETED";
    lottery.declaredAt = new Date();
    lottery.declaredByUserId = req.user?.userId || null;
    await lottery.save({ transaction });
    await transaction.commit();
    transaction = null;

    await safeRecordActivity({ action: "DRAW_COMPLETED", title: "Draw completed", message: `${lottery.lotteryName} draw completed.`, actorUserId: req.user?.userId || null, LotteryId: lottery.id, eventKey: `draw-completed:${lottery.id}` });
    for (const ticket of tickets.filter((item) => item.status === "WON")) {
      await safeRecordActivity({
        action: "WINNER_SELECTED",
        title: "Winning result credited",
        message: `${lottery.lotteryName} result matched ticket ${ticket.ticketNumber}. Prize ₹${ticket.winningAmount} was credited.`,
        actorUserId: req.user?.userId || null,
        UserId: ticket.UserId,
        LotteryId: lottery.id,
        TicketId: ticket.id,
        notifyUser: true,
        eventKey: `winner-result:${lottery.id}:${ticket.id}`,
      });
    }
    return res.json({ success: true, message: "Winning results declared and tickets settled", data: { lottery: withComputedStatus(lottery), results, matchedTickets: tickets.filter((ticket) => ticket.status === "WON").length, totalPaid: [...payouts.values()].reduce((sum, value) => sum + value, 0) } });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.publicWinningResults = { model: WinningResult, as: "winningResults", required: false };