const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const notifications = require("../controllers/notificationController");

const router = express.Router();
router.use(verifyToken);
router.get("/", notifications.listMine);
router.patch("/:id/read", notifications.markMineRead);
router.patch("/read-all", notifications.markAllMineRead);

module.exports = router;