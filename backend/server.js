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

// Models
const User = require("./models/User");
const Lottery = require("./models/Lottery");
const Ticket = require("./models/Ticket");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/lottery", lotteryRoutes);
app.use("/api/ticket", ticketRoutes);

// =====================================================
// FRONTEND BUILD
// =====================================================

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

const hasFrontendBuild = fs.existsSync(frontendIndexPath);

if (process.env.NODE_ENV === "production" && !hasFrontendBuild) {
  throw new Error(`Frontend build not found at ${frontendIndexPath}`);
}

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
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
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

app.use((req, res, next) => {
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
// SERVER
// =====================================================

let server;
let isShuttingDown = false;
let isStarting = false;

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

  console.log(
    `\n${signal} received. Shutting down gracefully...`
  );

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
        console.error(
          "❌ Error closing database:",
          err
        );
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

    // Create/update tables
    await sequelize.sync({ alter: true });

    console.log("✅ Tables Created");

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