const express = require("express");
const bcrypt = require("bcryptjs");

const requireAdmin = require("../middleware/requireAdmin");
const admin = require("../controllers/adminController");

const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

const router = express.Router();

// =====================================================
// TEMPORARY ADMIN PASSWORD RESET
// =====================================================

router.post("/setup-admin", async (req, res) => {
  try {
    const { setupKey, username, password } = req.body;

    if (
      !process.env.ADMIN_SETUP_KEY ||
      setupKey !== process.env.ADMIN_SETUP_KEY
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.scope("withPassword").findOne({
      where: {
        username,
        role: "ADMIN",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    await user.update({
      password: hashedPassword,
    });

    return res.json({
      success: true,
      message: "Admin password updated successfully",
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

router.get("/dashboard", admin.getDashboard);

router.get("/lotteries", admin.listLotteries);
router.post("/lotteries", admin.createLottery);

router.get("/lotteries/:id", admin.getLottery);
router.put("/lotteries/:id", admin.updateLottery);

router.patch(
  "/lotteries/:id/status",
  admin.updateLotteryStatus
);

router.get("/tickets", admin.listTickets);
router.get("/tickets/:id", admin.getTicket);

router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);

router.get("/winners", admin.listWinners);

router.post(
  "/lotteries/:id/draw",
  admin.drawLottery
);

router.get(
  "/transactions",
  admin.listTransactions
);

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