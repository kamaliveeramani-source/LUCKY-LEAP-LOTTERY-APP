const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  buyTicket,
  getMyTickets
} = require("../controllers/ticketController");

router.post("/buy", authMiddleware, buyTicket);

router.get("/mytickets", authMiddleware, getMyTickets);

module.exports = router;