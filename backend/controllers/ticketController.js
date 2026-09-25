const { Op } = require("sequelize");

const sequelize = require("../config/database");
const Ticket = require("../models/Ticket");
const Lottery = require("../models/Lottery");
const WinningResult = require("../models/WinningResult");
const GameDefinition = require("../models/GameDefinition");
const GameRound = require("../models/GameRound");
const GameOption = require("../models/GameOption");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { safeRecordActivity } = require("../services/operationalEvents");

const GAME_MULTIPLIERS = [1, 3, 9, 27, 81, 243, 729];

async function buyGameTicket(req, res) {
  let transaction;
  const fail = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    throw error;
  };

  try {
    const { gameId, roundId, selectedValue, GameOptionId, stakeAmount, multiplier = 1 } = req.body || {};
    const parsedGameId = Number(gameId);
    const parsedRoundId = Number(roundId);
    const betAmount = Number(stakeAmount);
    const parsedMultiplier = Number(multiplier);
    const totalBet = Number((betAmount * parsedMultiplier).toFixed(2));

    if (!Number.isInteger(parsedGameId) || parsedGameId <= 0 || !Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
      return res.status(400).json({ success: false, message: "A valid game and round are required" });
    }
    if (selectedValue === undefined || selectedValue === null || String(selectedValue).trim() === "") {
      return res.status(400).json({ success: false, message: "A selection is required" });
    }
    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      return res.status(400).json({ success: false, message: "Bet amount must be greater than 0" });
    }
    if (!GAME_MULTIPLIERS.includes(parsedMultiplier)) {
      return res.status(400).json({ success: false, message: "Multiplier is invalid" });
    }

    transaction = await sequelize.transaction();
    const user = await User.findByPk(req.user.userId, { transaction });
    if (!user) fail("User not found", 404);

    const game = await GameDefinition.findOne({ where: { id: parsedGameId, enabled: true }, transaction });
    if (!game) fail("Game not found", 404);

    const round = await GameRound.findOne({
      where: { id: parsedRoundId, GameDefinitionId: parsedGameId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const now = new Date();
    if (!round || round.status !== "OPEN" || now < round.startTime || now >= round.endTime) {
      fail("Round is closed for selections");
    }

    let option = null;
    if (GameOptionId !== undefined && GameOptionId !== null) {
      option = await GameOption.findOne({ where: { id: Number(GameOptionId), GameDefinitionId: parsedGameId, enabled: true }, transaction });
      if (!option) fail("Selected option is invalid");
    }

    const existing = await Ticket.findOne({ where: { UserId: user.id, GameRoundId: parsedRoundId }, transaction, lock: transaction.LOCK.UPDATE });
    if (existing) fail("A ticket already exists for this round");

    const wallet = await Wallet.findOne({ where: { UserId: user.id }, transaction, lock: transaction.LOCK.UPDATE });
    const currentBalance = Number(wallet?.balance || 0);
    if (!wallet || currentBalance < totalBet) {
      const error = new Error("Insufficient wallet balance. Please add cash to continue.");
      error.status = 400;
      error.balance = currentBalance;
      error.required = totalBet;
      throw error;
    }

    const newBalance = Number((currentBalance - totalBet).toFixed(2));
    wallet.balance = newBalance;
    wallet.todaysBets = Number(wallet.todaysBets || 0) + 1;
    await wallet.save({ transaction });

    const ticket = await Ticket.create({
      ticketNumber: `GT${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`,
      betType: "GAME",
      selectedNumber: String(selectedValue),
      amount: totalBet,
      stakeAmount: betAmount,
      multiplier: parsedMultiplier,
      winningAmount: 0,
      status: "PENDING",
      UserId: user.id,
      GameDefinitionId: parsedGameId,
      GameRoundId: parsedRoundId,
    }, { transaction });

    await transaction.commit();
    transaction = null;
    await safeRecordActivity({ action: "GAME_TICKET_PURCHASED", title: "Game ticket purchased", message: `${user.fullName} purchased game ticket ${ticket.ticketNumber}.`, UserId: user.id, eventKey: `game-ticket-purchased:${ticket.id}` });
    return res.status(201).json({ success: true, message: "Bet placed successfully", wallet: newBalance, ticket });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Game ticket purchase error:", error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || "Unable to place bet", ...(error.balance !== undefined ? { balance: error.balance, required: error.required } : {}) });
  }
}

// ======================================================
// BUY TICKET
// ======================================================
exports.buyTicket = async (req, res) => {
  let transaction;

  try {
    if (req.body?.gameId !== undefined) return buyGameTicket(req, res);
    const {
      lotteryId,
      betType,
      selectedNumber,
      amount,
    } = req.body || {};

    // 1. Validate required fields
    if (
      lotteryId === undefined ||
      lotteryId === null ||
      betType === undefined ||
      betType === null ||
      selectedNumber === undefined ||
      selectedNumber === null ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "lotteryId, betType, selectedNumber and amount are required",
      });
    }

    // 2. Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 3. Validate lottery ID
    const lotteryIdNumber = Number(lotteryId);

    if (!Number.isInteger(lotteryIdNumber) || lotteryIdNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lotteryId",
      });
    }

    // 4. Validate bet type
    const normalizedBetType = String(betType)
      .trim()
      .toUpperCase();

    if (!["SINGLE", "DOUBLE", "TRIPLE"].includes(normalizedBetType)) {
      return res.status(400).json({
        success: false,
        message: "betType must be SINGLE, DOUBLE or TRIPLE",
      });
    }

    // 5. Validate selected number
    const numberString = String(selectedNumber).trim();

    const requiredLength = {
      SINGLE: 1,
      DOUBLE: 2,
      TRIPLE: 3,
    }[normalizedBetType];

    const numberRegex = new RegExp(
      `^\\d{${requiredLength}}$`
    );

    if (!numberRegex.test(numberString)) {
      return res.status(400).json({
        success: false,
        message: `${normalizedBetType} requires exactly ${requiredLength} digit(s)`,
      });
    }

    // 6. Validate amount
    const betAmount = Number(amount);

    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // 7. Find user
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 8. Find lottery
    const lottery = await Lottery.findByPk(lotteryIdNumber);

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    if (!lottery.isActive) {
      return res.status(400).json({
        success: false,
        message: "Lottery is inactive",
      });
    }

    // 9. Check draw date and time (draw closes 30 minutes before draw time)
    if (lottery.drawDate) {
      const drawDate = new Date(lottery.drawDate);
      const now = new Date();

      if (!Number.isNaN(drawDate.getTime())) {
        // Check if draw is today or in the future by comparing just the date parts
        const drawDateOnly = new Date(drawDate.getFullYear(), drawDate.getMonth(), drawDate.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Draw closes 30 minutes before the scheduled draw time (15:00 / 3 PM)
        // Assuming draws are scheduled for 15:00 (3 PM)
        const drawClosureTime = new Date(drawDateOnly);
        drawClosureTime.setHours(14, 30, 0, 0); // Closes at 2:30 PM

        // If current time is past the closure time on or after draw date, reject
        if (now >= drawClosureTime && todayOnly >= drawDateOnly) {
          return res.status(400).json({
            success: false,
            message: "This lottery draw has already closed",
          });
        }
      }
    }

    // 10. Start transaction
    transaction = await sequelize.transaction();

    // 11. Find wallet
    let wallet = await Wallet.findOne({
      where: {
        UserId: user.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // 12. Create wallet if missing
    if (!wallet) {
      wallet = await Wallet.create(
        {
          UserId: user.id,
          balance: Number(user.wallet) || 0,
          todaysBets: 0,
        },
        {
          transaction,
        }
      );
    }

    // 13. Check balance
    const currentBalance = Number(wallet.balance) || 0;

    if (currentBalance < betAmount) {
      await transaction.rollback();
      transaction = null;

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance. Please add cash to continue.",
        balance: currentBalance,
        required: betAmount,
      });
    }

    // 14. Deduct amount
    const newBalance = Number(
      (currentBalance - betAmount).toFixed(2)
    );

    wallet.balance = newBalance;
    wallet.todaysBets =
      Number(wallet.todaysBets || 0) + 1;

    await wallet.save({
      transaction,
    });

    // 15. Generate ticket number
    const ticketNumber =
      "LT" +
      Date.now() +
      Math.floor(100000 + Math.random() * 900000);

    // 16. Create ticket
    const ticket = await Ticket.create(
      {
        ticketNumber,
        betType: normalizedBetType,
        selectedNumber: numberString,
        amount: betAmount,
        winningAmount: 0,
        status: "PENDING",
        UserId: user.id,
        LotteryId: lottery.id,
      },
      {
        transaction,
      }
    );

    // 17. Commit
    await transaction.commit();
    transaction = null;

    await safeRecordActivity({ action: "TICKET_PURCHASED", title: "Ticket purchased", message: `${user.fullName} purchased ticket ${ticket.ticketNumber}.`, UserId: user.id, LotteryId: lottery.id, TicketId: ticket.id, eventKey: `ticket-purchased:${ticket.id}` });

    // 18. Response
    return res.status(201).json({
      success: true,
      message: "Ticket Purchased Successfully",
      wallet: newBalance,
      ticket,
    });

  } catch (error) {
    console.error("Buy Ticket Error:", error);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback Error:",
          rollbackError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET MY TICKETS
// ======================================================
exports.getMyTickets = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tickets = await Ticket.findAll({
      where: {
        UserId: req.user.userId,
      },
      include: [
        {
          model: Lottery,
          include: [{ model: WinningResult, as: "winningResults", required: false, where: { status: "DECLARED" } }],
        },
        {
          model: GameDefinition,
        },
        {
          model: GameRound,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      tickets,
    });

  } catch (error) {
    console.error(
      "Get My Tickets Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DRAW WINNER
// ======================================================
exports.drawWinner = async (req, res) => {
  try {
    const { lotteryId } = req.body || {};

    if (
      lotteryId === undefined ||
      lotteryId === null
    ) {
      return res.status(400).json({
        success: false,
        message: "lotteryId is required",
      });
    }

    const lotteryIdNumber = Number(lotteryId);

    if (
      !Number.isInteger(lotteryIdNumber) ||
      lotteryIdNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lotteryId",
      });
    }

    // Find lottery
    const lottery =
      await Lottery.findByPk(lotteryIdNumber);

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    // Don't draw twice
    if (lottery.winnerTicketId) {
      return res.status(400).json({
        success: false,
        message: "Winner has already been selected",
        winnerTicketId:
          lottery.winnerTicketId,
      });
    }

    // Get tickets
    const tickets = await Ticket.findAll({
      where: {
        LotteryId: lotteryIdNumber,
      },
    });

    if (tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tickets sold for this lottery",
      });
    }

    // Select winner
    const randomIndex = Math.floor(
      Math.random() * tickets.length
    );

    const winnerTicket =
      tickets[randomIndex];

    // Save winner
    lottery.winnerTicketId =
      winnerTicket.id;

    await lottery.save();

    // Update winner
    winnerTicket.status = "WON";
    winnerTicket.winningAmount =
      Number(lottery.firstPrize) || 0;

    await winnerTicket.save();

    // Mark remaining tickets LOST
    await Ticket.update(
      {
        status: "LOST",
      },
      {
        where: {
          LotteryId: lotteryIdNumber,
          id: {
            [Op.ne]: winnerTicket.id,
          },
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Winner Selected Successfully",
      winner: winnerTicket,
      lottery,
    });

  } catch (error) {
    console.error(
      "Draw Winner Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};