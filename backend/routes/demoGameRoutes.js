const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/demoGameController");

const router = express.Router();

router.get("/games", controller.listGames);
router.get("/games/demo-wallet", authMiddleware, controller.getDemoWallet);
router.post("/games/:id/selections", authMiddleware, controller.createSelection);
router.get("/games/:id/selections", authMiddleware, controller.listUserSelections);
router.get("/games/:id", controller.getGame);
router.get("/games/:id/rounds", controller.getRounds);
router.get("/games/:id/results", controller.getResults);
router.get("/games/:id/history", controller.getHistory);

module.exports = router;
