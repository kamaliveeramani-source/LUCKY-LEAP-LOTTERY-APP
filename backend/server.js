const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const Lottery = require("./models/Lottery");
const lotteryRoutes = require("./routes/lotteryRoutes");
const Ticket = require("./models/Ticket");
const ticketRoutes = require("./routes/ticketRoutes");
require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/lottery", lotteryRoutes);
app.use("/api/ticket", ticketRoutes);
// Test API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lottery API Running Successfully"
  });
});

// Database Connection
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ PostgreSQL Connected");

    // Create tables automatically
    await sequelize.sync({ alter: true });

    console.log("✅ Tables Created");

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server Running on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err);
  });