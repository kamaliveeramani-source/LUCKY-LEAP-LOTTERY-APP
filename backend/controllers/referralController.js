const { Op } = require("sequelize");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Referral = require("../models/Referral");

const normalizePhone = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  return digits.startsWith("0") ? digits.slice(1) : digits;
};

const generateReferralCode = (user) => {
  const nameSeed = (user.fullName || "LUCKYHORSE")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase() || "LUCK";

  return `${nameSeed}${String(user.id).padStart(5, "0")}`;
};

const ensureWalletForUser = async (userId) => {
  let wallet = await Wallet.findOne({ where: { UserId: userId } });
  if (!wallet) {
    wallet = await Wallet.create({ UserId: userId });
  }
  return wallet;
};

const creditReferralReward = async (referrerId, referredUserId) => {
  const referrer = await User.findByPk(referrerId);
  if (!referrer) return null;

  const referral = await Referral.findOne({
    where: {
      UserId: referrerId,
      referredUserId,
    },
  });

  if (!referral || referral.rewardCredited) {
    return null;
  }

  const wallet = await ensureWalletForUser(referrerId);
  const amount = Number(referral.rewardAmount || 250);

  wallet.balance = Number(wallet.balance || 0) + amount;
  wallet.bonus = Number(wallet.bonus || 0) + amount;
  await wallet.save();

  referrer.wallet = wallet.balance;
  await referrer.save();

  referral.status = "QUALIFIED";
  referral.rewardCredited = true;
  referral.rewardedAt = new Date();
  referral.rewardReason = "Successful referral signup";
  await referral.save();

  return { referrer, wallet, referral };
};

exports.getMyReferralInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let code = user.referralCode || null;
    if (!code) {
      code = generateReferralCode(user);
      user.referralCode = code;
      await user.save();
    }

    const referrals = await Referral.findAll({
      where: { UserId: user.id },
      order: [["createdAt", "DESC"]],
      include: [
        { association: "referredUser", attributes: ["id", "fullName", "mobile", "email"] },
      ],
    });

    const referralLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?ref=${encodeURIComponent(code)}`;

    const successfulReferrals = referrals.filter((entry) => entry.status === "QUALIFIED" || entry.rewardCredited).length;

    return res.json({
      success: true,
      data: {
        referralCode: code,
        referralLink,
        rewardAmount: 250,
        totalReferrals: referrals.length,
        successfulReferrals,
        pendingReferrals: referrals.filter((entry) => !entry.rewardCredited && entry.status !== "QUALIFIED").length,
        referrals: referrals.map((entry) => ({
          id: entry.id,
          friendPhone: entry.friendPhone,
          shareChannel: entry.shareChannel,
          status: entry.status,
          rewardAmount: Number(entry.rewardAmount || 250),
          rewardCredited: Boolean(entry.rewardCredited),
          referredUser: entry.referredUser ? {
            id: entry.referredUser.id,
            fullName: entry.referredUser.fullName,
            mobile: entry.referredUser.mobile,
          } : null,
          createdAt: entry.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get referral info error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to load referral info" });
  }
};

exports.createReferral = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let { friendPhone, shareChannel, referralCode } = req.body || {};
    const normalizedPhone = normalizePhone(friendPhone);

    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: "Please enter a valid phone number" });
    }

    if (normalizedPhone === normalizePhone(user.mobile)) {
      return res.status(400).json({ success: false, message: "You cannot refer yourself" });
    }

    const codeToUse = referralCode || user.referralCode || generateReferralCode(user);
    if (!user.referralCode) {
      user.referralCode = codeToUse;
      await user.save();
    }

    const existingReferral = await Referral.findOne({
      where: {
        UserId: user.id,
        friendPhone: normalizedPhone,
      },
    });

    if (existingReferral) {
      return res.status(200).json({
        success: true,
        message: "Referral already registered",
        data: existingReferral,
      });
    }

    const referral = await Referral.create({
      UserId: user.id,
      referralCode: codeToUse,
      friendPhone: normalizedPhone,
      shareChannel: shareChannel || "LINK",
      status: "PENDING",
      rewardAmount: 250,
      rewardCredited: false,
    });

    return res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: referral,
    });
  } catch (error) {
    console.error("Create referral error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to create referral" });
  }
};

exports.checkReferralStatus = async (req, res) => {
  try {
    const { friendPhone } = req.query;
    if (!friendPhone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const normalizedPhone = normalizePhone(friendPhone);
    const referral = await Referral.findOne({
      where: {
        friendPhone: normalizedPhone,
      },
      include: [
        { association: "referrer", attributes: ["id", "fullName", "mobile"] },
        { association: "referredUser", attributes: ["id", "fullName", "mobile"] },
      ],
    });

    return res.json({
      success: true,
      data: referral ? {
        id: referral.id,
        friendPhone: referral.friendPhone,
        status: referral.status,
        rewardCredited: Boolean(referral.rewardCredited),
        rewardAmount: Number(referral.rewardAmount || 250),
        referrer: referral.referrer ? {
          id: referral.referrer.id,
          fullName: referral.referrer.fullName,
          mobile: referral.referrer.mobile,
        } : null,
        referredUser: referral.referredUser ? {
          id: referral.referredUser.id,
          fullName: referral.referredUser.fullName,
          mobile: referral.referredUser.mobile,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error("Check referral status error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to check referral status" });
  }
};

exports.claimReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body || {};
    const currentUser = await User.findByPk(req.user.userId);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!referralCode) {
      return res.status(400).json({ success: false, message: "Referral code is required" });
    }

    const referrer = await User.findOne({ where: { referralCode } });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Invalid referral code" });
    }

    if (referrer.id === currentUser.id) {
      return res.status(400).json({ success: false, message: "You cannot use your own referral code" });
    }

    const normalizedPhone = normalizePhone(currentUser.mobile);
    const existingReferral = await Referral.findOne({
      where: {
        UserId: referrer.id,
        friendPhone: normalizedPhone,
      },
    });

    if (existingReferral) {
      if (existingReferral.referredUserId !== currentUser.id) {
        existingReferral.referredUserId = currentUser.id;
        existingReferral.status = "REGISTERED";
        await existingReferral.save();
      }

      return res.json({
        success: true,
        message: "Referral already linked to this account",
        data: existingReferral,
      });
    }

    const referral = await Referral.create({
      UserId: referrer.id,
      referredUserId: currentUser.id,
      referralCode,
      friendPhone: normalizedPhone,
      shareChannel: "CODE",
      status: "REGISTERED",
      rewardAmount: 250,
      rewardCredited: false,
    });

    const wallet = await ensureWalletForUser(referrer.id);
    const amount = Number(referral.rewardAmount || 250);
    wallet.balance = Number(wallet.balance || 0) + amount;
    wallet.bonus = Number(wallet.bonus || 0) + amount;
    await wallet.save();

    referrer.wallet = wallet.balance;
    await referrer.save();

    referral.rewardCredited = true;
    referral.rewardedAt = new Date();
    referral.rewardReason = "Referral registered through code";
    referral.status = "QUALIFIED";
    await referral.save();

    return res.status(201).json({
      success: true,
      message: "Referral applied successfully",
      data: referral,
    });
  } catch (error) {
    console.error("Claim referral code error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to apply referral" });
  }
};

exports.applyReferralToUserIfNeeded = async (user, providedReferralCode = null) => {
  const code = (providedReferralCode || user?.referralCode || "").trim();
  if (!user || !code) return null;

  const referrer = await User.findOne({ where: { referralCode: code } });
  if (!referrer || referrer.id === user.id) return null;

  const existingReferral = await Referral.findOne({
    where: {
      UserId: referrer.id,
      friendPhone: normalizePhone(user.mobile),
    },
  });

  if (existingReferral) {
    if (existingReferral.referredUserId !== user.id) {
      existingReferral.referredUserId = user.id;
      existingReferral.status = "REGISTERED";
      await existingReferral.save();
    }

    if (!existingReferral.rewardCredited) {
      await creditReferralReward(referrer.id, user.id);
    }
    return existingReferral;
  }

  const referral = await Referral.create({
    UserId: referrer.id,
    referredUserId: user.id,
    referralCode: code,
    friendPhone: normalizePhone(user.mobile),
    shareChannel: "CODE",
    status: "REGISTERED",
    rewardAmount: 250,
    rewardCredited: false,
  });

  await creditReferralReward(referrer.id, user.id);
  return referral;
};
