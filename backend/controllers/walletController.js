const { Op } = require("sequelize");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const normalizeUserWallet = async (user) => {
  if (!user) return null;

  // Ensure Wallet record exists and is initialized
  let wallet = await Wallet.findOne({ where: { UserId: user.id } });
  if (!wallet) {
    wallet = await Wallet.create({ UserId: user.id });
  }

  // keep legacy user.wallet in sync if it exists as null/undefined
  if (user.wallet === null || user.wallet === undefined || Number.isNaN(Number(user.wallet))) {
    user.wallet = wallet.balance;
    await user.save();
  }

  return { user, wallet };
};

// Get Wallet Balance
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { wallet } = await normalizeUserWallet(user);

    res.status(200).json({
      success: true,
      wallet: Number(wallet.balance),
      bonus: Number(wallet.bonus || 0),
      winning: Number(wallet.winning || 0),
      todaysEarnings: Number(wallet.todaysEarnings || 0),
      todaysBets: Number(wallet.todaysBets || 0),
      totalDeposit: Number(wallet.totalDeposit || 0),
      totalWithdraw: Number(wallet.totalWithdraw || 0),
      totalWinning: Number(wallet.totalWinning || 0),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add Money to Wallet
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount"
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { wallet } = await normalizeUserWallet(user);

    wallet.balance = Number(wallet.balance) + Number(amount);
    wallet.totalDeposit = (wallet.totalDeposit || 0) + Number(amount);
    await wallet.save();

    // keep legacy user.wallet in sync
    user.wallet = wallet.balance;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Money Added Successfully",
      wallet: wallet.balance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Withdraw Money from Wallet
exports.withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount"
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { wallet } = await normalizeUserWallet(user);

    if (Number(wallet.balance) < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance"
      });
    }

    wallet.balance = Number(wallet.balance) - Number(amount);
    wallet.totalWithdraw = (wallet.totalWithdraw || 0) + Number(amount);
    await wallet.save();

    user.wallet = wallet.balance;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      wallet: wallet.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Transfer Money to another user
exports.transferMoney = async (req, res) => {
  try {
    const { amount, recipient } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount"
      });
    }

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: "Please enter a recipient mobile or email"
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { wallet: senderWallet } = await normalizeUserWallet(user);

    if (Number(senderWallet.balance) < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance"
      });
    }

    const recipientUser = await User.findOne({
      where: {
        [Op.or]: [
          { mobile: recipient },
          { email: recipient }
        ]
      }
    });

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found"
      });
    }

    if (recipientUser.id === user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer to yourself"
      });
    }

    const { wallet: recipientWallet } = await normalizeUserWallet(recipientUser);

    // Perform transfer
    senderWallet.balance = Number(senderWallet.balance) - Number(amount);
    recipientWallet.balance = Number(recipientWallet.balance) + Number(amount);

    await senderWallet.save();
    await recipientWallet.save();

    // sync legacy values
    user.wallet = senderWallet.balance;
    recipientUser.wallet = recipientWallet.balance;
    await user.save();
    await recipientUser.save();

    res.status(200).json({
      success: true,
      message: "Transfer successful",
      wallet: senderWallet.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};