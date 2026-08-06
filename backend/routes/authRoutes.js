const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

// Signup / Register
router.post("/signup", signup);
router.post("/register", signup);

// Login
router.post("/login", login);

module.exports = router;