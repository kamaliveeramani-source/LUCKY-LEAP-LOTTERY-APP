const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

router.get("/profile", verifyToken, (req, res) => {

    res.json({
        success: true,
        message: "Protected Route Accessed Successfully",
        user: req.user
    });

});

module.exports = router;