const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const sequelize = require("./config/database");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const lotteryRoutes = require("./routes/lotteryRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Models
require("./models/User");
require("./models/Lottery");
require("./models/Ticket");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    ...(process.env.ALLOWED_ORIGINS || "").split(","),
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
  ]
    .map((origin) => origin && origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS:", origin);
      return callback(null, false);
    },
  })
);

app.use(express.json());

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/lottery", lotteryRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// =====================================================
// FRONTEND BUILD
// =====================================================

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// =====================================================
// STATUS
// =====================================================

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Lottery API Running Successfully",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    return res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// =====================================================
// FRONTEND SERVING
// =====================================================

if (hasFrontendBuild) {
  app.use(
    express.static(frontendDistPath, {
      index: false,

      setHeaders: (res, filePath) => {
        if (path.extname(filePath).toLowerCase() === ".js") {
          res.setHeader(
            "Content-Type",
            "application/javascript; charset=utf-8"
          );
        }
      },
    })
  );

  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Lottery API Running Successfully",
    });
  });
}

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("❌ Request error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =====================================================
// SERVER VARIABLES
// =====================================================

let server;
let isShuttingDown = false;
let isStarting = false;

// =====================================================
// LISTEN WITH RETRY
// =====================================================

const listenWithRetry = (
  port,
  attempt = 1,
  maxAttempts = 10
) =>
  new Promise((resolve, reject) => {
    const instance = app.listen(port, () => {
      console.log(`🚀 Server Running on Port ${port}`);
      resolve(instance);
    });

    instance.once("error", (err) => {
      instance.close();

      if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
        console.warn(
          `Port ${port} busy during restart, retrying in 500ms (${attempt}/${maxAttempts - 1})...`
        );

        setTimeout(() => {
          listenWithRetry(
            port,
            attempt + 1,
            maxAttempts
          )
            .then(resolve)
            .catch(reject);
        }, 500);

        return;
      }

      reject(err);
    });
  });

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdown = (signal, exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  const finish = () => {
    if (signal === "SIGUSR2") {
      process.kill(process.pid, "SIGUSR2");
      return;
    }

    process.exit(exitCode);
  };

  if (!server) {
    sequelize
      .close()
      .catch(() => {})
      .finally(finish);

    return;
  }

  server.close(() => {
    sequelize
      .close()
      .catch((err) => {
        console.error("❌ Error closing database:", err);
      })
      .finally(finish);
  });
};

// =====================================================
// PROCESS EVENTS
// =====================================================

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.once("SIGUSR2", () => {
  shutdown("SIGUSR2");
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  if (isStarting) {
    return;
  }

  isStarting = true;

  try {
    // Test PostgreSQL connection
    await sequelize.authenticate();

    console.log("✅ PostgreSQL Connected");

    // =================================================
    // SYNC DATABASE MODELS
    // This adds missing columns such as "username"
    // =================================================

    await sequelize.sync({
      alter: true,
    });

    console.log("✅ Database schema synced");

    // Start server
    const port = Number(process.env.PORT) || 5000;

    server = await listenWithRetry(port);

  } catch (err) {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${Number(process.env.PORT) || 5000} is still in use after retries.`
      );
    } else {
      console.error("❌ Startup error:", err);
    }

    process.exit(1);
  }
};

startServer();