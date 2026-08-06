const Ticket = require("../models/Ticket");
const Lottery = require("../models/Lottery");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

// Buy Ticket
exports.buyTicket = async (req, res) => {
  try {
    const { lotteryId } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const lottery = await Lottery.findByPk(lotteryId);

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found"
      });
    }

    // Ensure Wallet exists for user
    let wallet = await Wallet.findOne({ where: { UserId: user.id } });
    if (!wallet) {
      wallet = await Wallet.create({ UserId: user.id, balance: Number(user.wallet) || 0 });
    }

    if (Number(wallet.balance) < Number(lottery.ticketPrice)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance"
      });
    }

    // Deduct wallet balance and increment todaysBets
    wallet.balance = Number(wallet.balance) - Number(lottery.ticketPrice);
    wallet.todaysBets = (wallet.todaysBets || 0) + 1;
    await wallet.save();

    // Generate ticket number
    const ticketNumber =
      "LT" + Date.now() + Math.floor(Math.random() * 1000);

    const ticket = await Ticket.create({
      ticketNumber,
      UserId: user.id,
      LotteryId: lottery.id
    });

    res.status(201).json({
      success: true,
      message: "Ticket Purchased Successfully",
      wallet: wallet.balance,
      ticket
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get My Tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: {
        UserId: req.user.userId
      },
      include: [Lottery]
    });

    res.status(200).json({
      success: true,
      tickets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.drawWinner = async (req, res) => {
  try {

    const { lotteryId } = req.body;

    const tickets = await Ticket.findAll({
      where: {
        LotteryId: lotteryId
      }
    });

    if (tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tickets sold for this lottery"
      });
    }

    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winnerTicket = tickets[randomIndex];

    const lottery = await Lottery.findByPk(lotteryId);

    lottery.winnerTicketId = winnerTicket.id;

    await lottery.save();

    res.status(200).json({
      success: true,
      message: "Winner Selected Successfully",
      winner: winnerTicket
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};