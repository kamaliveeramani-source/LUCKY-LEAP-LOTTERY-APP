const sequelize = require("../config/database");
require("../models/User");
require("../models/Lottery");
require("../models/Ticket");
require("../models/Wallet");
require("../models/Notification");
require("../models/ActivityLog");

async function migrate() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("Database schema checked; missing tables were created if needed.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });