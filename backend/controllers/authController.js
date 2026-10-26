const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

const User = require("../models/User");
const { safeRecordActivity } = require("../services/operationalEvents");
const { applyReferralToUserIfNeeded } = require("./referralController");

// ================== SIGNUP ==================

exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      mobile,
      email,
      password,
      referralCode,
    } = req.body;

    if (!fullName || !age || !gender || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: fullName, age, gender, mobile, email, password",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ mobile }, { email }],
      },
    });

    if (existingUser) {
      const duplicateField =
        existingUser.mobile === mobile ? "Mobile number" : "Email";

      return res.status(400).json({
        success: false,
        message: `${duplicateField} already registered`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      age,
      gender,
      mobile,
      email,
      password: hashedPassword,
      wallet: 0,
      role: "USER",
    });

    const Wallet = require("../models/Wallet");

    const existingWallet = await Wallet.findOne({
      where: { UserId: user.id },
    });

    if (!existingWallet) {
      await Wallet.create({
        UserId: user.id,
      });
    }

    if (referralCode) {
      await applyReferralToUserIfNeeded(user, referralCode);
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await safeRecordActivity({
      action: "USER_REGISTERED",
      title: "New user registered",
      message: `${user.fullName} created an account.`,
      UserId: user.id,
      eventKey: `user-registered:${user.id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// ================== LOGIN ==================

exports.login = async (req, res) => {
  try {
    const { username, mobile, password } = req.body || {};

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (
      (username !== undefined && typeof username !== "string") ||
      (mobile !== undefined && typeof mobile !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Username or mobile number is invalid",
      });
    }

    let whereCondition;

    // ================== ADMIN LOGIN ==================

    if (username && username.trim()) {
      whereCondition = {
        username: { [Op.iLike]: username.trim() },
        role: "ADMIN",
      };
    }

    // ================== NORMAL USER LOGIN ==================

    else if (mobile && mobile.trim()) {
      whereCondition = {
        mobile: mobile.trim(),
      };
    }

    // ================== NO LOGIN IDENTIFIER ==================

    else {
      return res.status(400).json({
        success: false,
        message: "Username or mobile number is required",
      });
    }

    const loginType = username && username.trim() ? "ADMIN" : "USER";

    // ================== FIND USER ==================

    const user = await User.scope("withPassword").findOne({
      where: whereCondition,
    });

    // ================== USER NOT FOUND ==================

    if (!user) {
      console.warn(`[LOGIN] 401 reason=user_not_found loginType=${loginType}`);

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ================== PASSWORD CHECK ==================

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn(
        `[LOGIN] 401 reason=password_mismatch loginType=${loginType} userId=${user.id} role=${user.role}`
      );

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ================== JWT ==================

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ================== ADMIN ACTIVITY ==================

    if (user.role === "ADMIN") {
      await safeRecordActivity({
        action: "ADMIN_LOGIN",
        title: "Admin login",
        message: `${user.username || "Admin"} signed in.`,
        actorUserId: user.id,
        eventKey: `admin-login:${user.id}:${Date.now()}`,
      });
    }

    // ================== LOGIN SUCCESS ==================

    console.log(`[LOGIN] success userId=${user.id} role=${user.role}`);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("[LOGIN] error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};