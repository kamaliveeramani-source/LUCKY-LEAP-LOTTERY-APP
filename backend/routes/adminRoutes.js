const express = require("express");
const bcrypt = require("bcryptjs");

const requireAdmin = require("../middleware/requireAdmin");
const admin = require("../controllers/adminController");

const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

const router = express.Router();

// =====================================================
// TEMPORARY ADMIN SETUP
// =====================================================

router.post("/setup-admin", async (req, res) => {
  try {
    const { setupKey, username, password } = req.body;

    // Check setup key
    if (
      !process.env.ADMIN_SETUP_KEY ||
      setupKey !== process.env.ADMIN_SETUP_KEY
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user with this username already exists
    let user = await User.scope("withPassword").findOne({
      where: {
        username,
      },
    });

    // =====================================================
    // EXISTING USER -> MAKE ADMIN AND UPDATE PASSWORD
    // =====================================================

    if (user) {
      await user.update({
        password: hashedPassword,
        role: "ADMIN",
      });

      return res.json({
        success: true,
        message: "Admin user updated successfully",
        data: {
          id: user.id,
          username: user.username,
          role: "ADMIN",
        },
      });
    }

    // =====================================================
    // NO USER -> CREATE NEW ADMIN
    // =====================================================

    const timestamp = Date.now();

    user = await User.create({
      fullName: "Administrator",
      age: 18,
      gender: "OTHER",

      // Must be unique because User model requires mobile
      mobile: `admin${timestamp}`,

      username,

      // Must be unique because User model requires email
      email: `${username}${timestamp}@admin.local`,

      password: hashedPassword,
      wallet: 0,
      role: "ADMIN",
    });

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Admin setup error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// ALL ROUTES BELOW REQUIRE ADMIN LOGIN
// =====================================================

router.use(requireAdmin);

// Dashboard
router.get("/dashboard", admin.getDashboard);

// Lotteries
router.get("/lotteries", admin.listLotteries);
router.post("/lotteries", admin.createLottery);
router.get("/lotteries/:id", admin.getLottery);
router.put("/lotteries/:id", admin.updateLottery);
router.patch(
  "/lotteries/:id/status",
  admin.updateLotteryStatus
);

// Tickets
router.get("/tickets", admin.listTickets);
router.get("/tickets/:id", admin.getTicket);

// Users
router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);

// Winners
router.get("/winners", admin.listWinners);

// Draw lottery
router.post(
  "/lotteries/:id/draw",
  admin.drawLottery
);

// Transactions
router.get(
  "/transactions",
  admin.listTransactions
);

// =====================================================
// NOTIFICATIONS
// =====================================================

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    return res.json({
      success: true,
      data: notifications,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch(
  "/notifications/:id/read",
  async (req, res) => {
    try {
      await Notification.update(
        {
          read: true,
        },
        {
          where: {
            id: Number(req.params.id),
          },
        }
      );

      return res.json({
        success: true,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.patch(
  "/notifications/read-all",
  async (req, res) => {
    try {
      await Notification.update(
        {
          read: true,
        },
        {
          where: {
            read: false,
          },
        }
      );

      return res.json({
        success: true,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================================================
// ACTIVITY LOG
// =====================================================

router.get("/activity", async (req, res) => {
  try {
    const activities = await ActivityLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    return res.json({
      success: true,
      data: activities,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;