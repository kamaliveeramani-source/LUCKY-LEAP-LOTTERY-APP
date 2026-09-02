const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  buyTicket,
  getMyTickets
} = require("../controllers/ticketController");

// Buy Ticket
router.post("/buy", authMiddleware, buyTicket);

// Get My Tickets
router.get("/mytickets", authMiddleware, getMyTickets);

module.exports = router;