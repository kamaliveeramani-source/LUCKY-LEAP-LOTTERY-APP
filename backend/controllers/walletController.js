const { Op } = require("sequelize");
const User = require("../models/User");

const normalizeWallet = async (user) => {
  if (!user) return null;

  if (user.wallet === null || user.wallet === undefined || Number.isNaN(Number(user.wallet))) {
    user.wallet = 0;
    await user.save();
  }

  return user;
};

// Get Wallet Balance
exports.getWallet = async (req, res) => {
  try {
    let user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user = await normalizeWallet(user);

    res.status(200).json({
      success: true,
      wallet: Number(user.wallet)
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

    let user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user = await normalizeWallet(user);
    user.wallet = Number(user.wallet) + Number(amount);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Money Added Successfully",
      wallet: user.wallet
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

    let user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user = await normalizeWallet(user);

    if (Number(user.wallet) < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Wallet Balance"
      });
    }

    user.wallet = Number(user.wallet) - Number(amount);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      wallet: user.wallet
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

    let user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user = await normalizeWallet(user);

    if (Number(user.wallet) < Number(amount)) {
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

    user.wallet = Number(user.wallet) - Number(amount);
    recipientUser.wallet = Number(recipientUser.wallet) + Number(amount);

    await user.save();
    await recipientUser.save();

    res.status(200).json({
      success: true,
      message: "Transfer successful",
      wallet: user.wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};