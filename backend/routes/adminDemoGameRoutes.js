const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const imageUpload = require("../middleware/imageUpload");
const controller = require("../controllers/demoGameController");

const router = express.Router();
router.use(requireAdmin);

router.get("/games", controller.listAdminGames);
router.post("/games", imageUpload, controller.createAdminGame);
router.put("/games/:id", imageUpload, controller.updateAdminGame);
router.post("/games/:id/rounds", controller.createRound);
router.get("/games/:id/selections", controller.listSelections);
router.get("/games/:id/history", controller.listAdminHistory);
router.put("/rounds/:id", controller.updateRound);
router.post("/rounds/:id/result", controller.publishResult);

module.exports = router;
