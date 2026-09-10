const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const imageUpload = require("../middleware/imageUpload");
const { gameController, promotionController, offerController } = require("../controllers/contentController");

function adminRoutes(controller) {
  const router = express.Router();
  router.use(requireAdmin);
  router.get("/", controller.list);
  router.post("/", imageUpload, controller.save);
  router.get("/:id", controller.get);
  router.put("/:id", imageUpload, controller.save);
  router.patch("/:id/status", controller.updateStatus);
  router.delete("/:id", controller.remove);
  return router;
}

const publicRoutes = express.Router();
publicRoutes.get("/promotions", promotionController.publicList);
publicRoutes.get("/offers", offerController.publicList);

module.exports = {
  publicRoutes,
  adminGameRoutes: adminRoutes(gameController),
  adminPromotionRoutes: adminRoutes(promotionController),
  adminOfferRoutes: adminRoutes(offerController),
};
