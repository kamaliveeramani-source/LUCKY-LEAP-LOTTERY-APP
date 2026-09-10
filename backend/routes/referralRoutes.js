const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getMyReferralInfo,
  createReferral,
  checkReferralStatus,
  claimReferralCode,
} = require("../controllers/referralController");

router.get("/me", auth, getMyReferralInfo);
router.post("/create", auth, createReferral);
router.get("/status", auth, checkReferralStatus);
router.post("/apply", auth, claimReferralCode);

module.exports = router;
