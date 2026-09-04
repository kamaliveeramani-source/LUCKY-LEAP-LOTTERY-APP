const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../models/User");
const { safeRecordActivity } = require("../services/operationalEvents");

// ================== SIGNUP ==================
exports.signup = async (req, res) => {
  try {
    const { fullName, age, gender, mobile, email, password } = req.body;

    if (!fullName || !age || !gender || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: fullName, age, gender, mobile, email, password"
      });
    }

    // Check existing user by mobile or email
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { mobile },
          { email }
        ]
      }
    });

    if (existingUser) {
      const duplicateField = existingUser.mobile === mobile ? "Mobile number" : "Email";
      return res.status(400).json({
        success: false,
        message: `${duplicateField} already registered`
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      age,
      gender,
      mobile,
      email,
      password: hashedPassword,
      wallet: 0
    });

    // Create associated Wallet record if not present
    const Wallet = require("../models/Wallet");
    const existingWallet = await Wallet.findOne({ where: { UserId: user.id } });
    if (!existingWallet) {
      await Wallet.create({ UserId: user.id });
    }

    // Generate JWT
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

    await safeRecordActivity({ action: "USER_REGISTERED", title: "New user registered", message: `${user.fullName} created an account.`, UserId: user.id, eventKey: `user-registered:${user.id}` });
    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { username, mobile, password } = req.body;

    const user = await User.scope("withPassword").findOne({
      where: username ? { username, role: "ADMIN" } : { mobile }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate token
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

    if (user.role === "ADMIN") await safeRecordActivity({ action: "ADMIN_LOGIN", title: "Admin login", message: `${user.username || "Admin"} signed in.`, actorUserId: user.id, eventKey: `admin-login:${user.id}:${Date.now()}` });
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};