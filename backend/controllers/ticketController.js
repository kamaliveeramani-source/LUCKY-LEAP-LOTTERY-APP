const { Op } = require("sequelize");

const sequelize = require("../config/database");
const Ticket = require("../models/Ticket");
const Lottery = require("../models/Lottery");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { safeRecordActivity } = require("../services/operationalEvents");

// ======================================================
// BUY TICKET
// ======================================================
exports.buyTicket = async (req, res) => {
  let transaction;

  try {
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
        message: "Insufficient Wallet Balance",
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