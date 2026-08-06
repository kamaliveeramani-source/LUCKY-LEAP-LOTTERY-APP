const Ticket = require("../models/Ticket");
const Lottery = require("../models/Lottery");
const User = require("../models/User");

// Create Lottery
exports.createLottery = async (req, res) => {
  try {
    const lottery = await Lottery.create({
      lotteryName: req.body.lotteryName,
      ticketPrice: req.body.ticketPrice,
      firstPrize: req.body.firstPrize,
      secondPrize: req.body.secondPrize,
      thirdPrize: req.body.thirdPrize,
      totalTickets: req.body.totalTickets,
      drawDate: req.body.drawDate
    });

    res.status(201).json({
      success: true,
      message: "Lottery Created Successfully",
      data: lottery
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Lotteries
exports.getLotteries = async (req, res) => {
  try {
    const lotteries = await Lottery.findAll();

    res.status(200).json({
      success: true,
      data: lotteries
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Draw Winner
exports.drawWinner = async (req, res) => {
  try {
    const { lotteryId } = req.body;

    const lottery = await Lottery.findByPk(lotteryId);

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found"
      });
    }

    const tickets = await Ticket.findAll({
      where: {
        LotteryId: lotteryId
      }
    });

    if (tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tickets sold"
      });
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winnerTicket = tickets[randomIndex];

    // Save winner ticket
    lottery.winnerTicketId = winnerTicket.id;
    await lottery.save();

    // Credit prize to winner
    const winner = await User.findByPk(winnerTicket.UserId);

    winner.wallet =
      Number(winner.wallet) + Number(lottery.firstPrize);

    await winner.save();

    res.status(200).json({
      success: true,
      message: "Winner Selected Successfully",
      winnerTicket,
      winnerWallet: winner.wallet
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};