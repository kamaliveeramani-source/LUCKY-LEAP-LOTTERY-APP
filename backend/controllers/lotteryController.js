const { Op } = require("sequelize");
const Ticket = require("../models/Ticket");
const Lottery = require("../models/Lottery");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

// ==========================================
// CREATE LOTTERY
// ==========================================

exports.createLottery = async (req, res) => {
  try {
    const {
      lotteryName,
      ticketPrice,
      firstPrize,
      secondPrize,
      thirdPrize,
      totalTickets,
      drawDate,
    } = req.body || {};

    if (!lotteryName || !ticketPrice || !firstPrize || !drawDate) {
      return res.status(400).json({
        success: false,
        message: "lotteryName, ticketPrice, firstPrize and drawDate are required",
      });
    }

    const lottery = await Lottery.create({
      lotteryName,
      ticketPrice,
      firstPrize,
      secondPrize,
      thirdPrize,
      totalTickets,
      drawDate,
    });

    return res.status(201).json({
      success: true,
      message: "Lottery Created Successfully",
      data: lottery,
    });
  } catch (error) {
    console.error("Create Lottery Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL LOTTERIES
// ==========================================

exports.getLotteries = async (req, res) => {
  try {
    const lotteries = await Lottery.findAll({
      where: {
        [Op.and]: [
          {
            lotteryName: {
              [Op.notILike]: "%demo%",
            },
          },
          {
            lotteryName: {
              [Op.notILike]: "%test%",
            },
          },
        ],
      },
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: lotteries,
    });
  } catch (error) {
    console.error("Get Lotteries Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLotteryById = async (req, res) => {
  try {
    const { id } = req.params || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lottery ID is required",
      });
    }

    const lottery = await Lottery.findByPk(Number(id));

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    const isTestLottery = /demo|test/i.test(lottery.lotteryName || "");

    if (isTestLottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: lottery,
    });
  } catch (error) {
    console.error("Get Lottery By Id Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DRAW WINNER
// ==========================================

exports.drawWinner = async (req, res) => {
  try {
    // IMPORTANT:
    // req.body can be undefined, so use || {}
    const { lotteryId } = req.body || {};

    // ------------------------------------------
    // 1. Validate lotteryId
    // ------------------------------------------

    if (!lotteryId) {
      return res.status(400).json({
        success: false,
        message: "lotteryId is required",
      });
    }

    // ------------------------------------------
    // 2. Find lottery
    // ------------------------------------------

    const lottery = await Lottery.findByPk(lotteryId);

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    // ------------------------------------------
    // 3. Prevent duplicate draw
    // ------------------------------------------

    if (lottery.winnerTicketId !== null && lottery.winnerTicketId !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Winner has already been selected for this lottery",
        winnerTicketId: lottery.winnerTicketId,
      });
    }

    // ------------------------------------------
    // 4. Find pending tickets
    // ------------------------------------------

    const tickets = await Ticket.findAll({
      where: {
        LotteryId: lotteryId,
        status: "PENDING",
      },
    });

    if (tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending tickets available",
      });
    }

    // ------------------------------------------
    // 5. Select random winner
    // ------------------------------------------

    const randomIndex = Math.floor(Math.random() * tickets.length);

    const winnerTicket = tickets[randomIndex];

    // ------------------------------------------
    // 6. Find winner user
    // ------------------------------------------

    const winner = await User.findByPk(winnerTicket.UserId);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner user not found",
      });
    }

    // ------------------------------------------
    // 7. Get prize
    // ------------------------------------------

    const prizeAmount = Number(lottery.firstPrize) || 0;

    if (prizeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid first prize amount",
      });
    }

    // ------------------------------------------
    // 8. Find or create wallet
    // ------------------------------------------

    let winnerWallet = await Wallet.findOne({
      where: {
        UserId: winner.id,
      },
    });

    if (!winnerWallet) {
      winnerWallet = await Wallet.create({
        UserId: winner.id,
        balance: Number(winner.wallet) || 0,
        winning: 0,
        totalWinning: 0,
      });
    }

    // ------------------------------------------
    // 9. Update winning ticket
    // ------------------------------------------

    winnerTicket.status = "WON";
    winnerTicket.winningAmount = prizeAmount;

    await winnerTicket.save();

    // ------------------------------------------
    // 10. Credit winner wallet
    // ------------------------------------------

    winnerWallet.balance =
      Number(winnerWallet.balance || 0) + prizeAmount;

    winnerWallet.winning =
      Number(winnerWallet.winning || 0) + prizeAmount;

    winnerWallet.totalWinning =
      Number(winnerWallet.totalWinning || 0) + prizeAmount;

    await winnerWallet.save();

    // ------------------------------------------
    // 11. Keep User.wallet synchronized
    // ------------------------------------------

    winner.wallet = winnerWallet.balance;

    await winner.save();

    // ------------------------------------------
    // 12. Save winner ticket in lottery
    // ------------------------------------------

    lottery.winnerTicketId = winnerTicket.id;

    await lottery.save();

    // ------------------------------------------
    // 13. Success response
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Winner Selected Successfully",

      winnerTicket: {
        id: winnerTicket.id,
        ticketNumber: winnerTicket.ticketNumber,
        betType: winnerTicket.betType,
        selectedNumber: winnerTicket.selectedNumber,
        amount: winnerTicket.amount,
        winningAmount: winnerTicket.winningAmount,
        status: winnerTicket.status,
        UserId: winnerTicket.UserId,
        LotteryId: winnerTicket.LotteryId,
      },

      prizeAmount,

      winnerWallet: winnerWallet.balance,
    });

  } catch (error) {
    console.error("Draw Winner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};