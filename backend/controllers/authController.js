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
    const { username, mobile, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    let whereCondition;

    // ================== ADMIN LOGIN ==================

    if (username && username.trim()) {
      whereCondition = {
        username: username.trim(),
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

    console.log("[LOGIN DEBUG] Searching user:", {
      username: username?.trim() || null,
      mobile: mobile?.trim() || null,
      loginType:
        username && username.trim()
          ? "ADMIN"
          : mobile && mobile.trim()
          ? "USER"
          : "UNKNOWN",
    });

    // ================== FIND USER ==================

    const user = await User.scope("withPassword").findOne({
      where: whereCondition,
    });

    console.log("[LOGIN DEBUG] User lookup:", {
      foundUser: !!user,
      userId: user?.id || null,
      role: user?.role || null,
      mobile: user?.mobile || null,
      username: user?.username || null,
      hasPasswordHash: !!user?.password,
    });

    // ================== USER NOT FOUND ==================

    if (!user) {
      console.warn("[LOGIN DEBUG] User not found:", {
        whereCondition,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // ================== PASSWORD CHECK ==================

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("[LOGIN DEBUG] Password check:", {
      userId: user.id,
      passwordMatched: isMatch,
    });

    if (!isMatch) {
      console.warn("[LOGIN DEBUG] Password mismatch:", {
        userId: user.id,
        role: user.role,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
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

    console.log("[LOGIN SUCCESS]", {
      userId: user.id,
      role: user.role,
      mobile: user.mobile || null,
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};