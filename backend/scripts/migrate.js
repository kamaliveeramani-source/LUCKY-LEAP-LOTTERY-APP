const { DataTypes, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");
require("../models/User");
require("../models/Lottery");
require("../models/Ticket");
require("../models/Wallet");
require("../models/Notification");
require("../models/ActivityLog");
require("../models/Game");
require("../models/Promotion");
require("../models/Offer");
require("../models/WinningResult");
require("../services/demoGameModels");
require("../models/LotteryEntryAmount");

const migrations = [
  require("../migrations/001-create-demo-game-foundation"),
  require("../migrations/002-extend-games-catalogue"),
  require("../migrations/003-seed-phase1-game-definitions"),
  require("../migrations/004-add-winning-results"),
  require("../migrations/005-normalize-phase1-games"),
  require("../migrations/006-add-demo-selection-pricing"),
  require("../migrations/007-add-lottery-entry-amounts"),
];

async function migrate() {
  await sequelize.authenticate();
  await sequelize.sync();
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  if (!tables.some((table) => String(table).toLowerCase() === "schema_migrations")) {
    await queryInterface.createTable("schema_migrations", {
      name: { type: DataTypes.STRING(160), primaryKey: true, allowNull: false },
      runAt: { type: DataTypes.DATE, allowNull: false },
    });
  }
  const applied = new Set((await queryInterface.sequelize.query("SELECT name FROM schema_migrations", { type: QueryTypes.SELECT })).map((row) => row.name));
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    const transaction = await sequelize.transaction();
    try {
      await migration.up(queryInterface, transaction);
      await queryInterface.bulkInsert("schema_migrations", [{ name: migration.name, runAt: new Date() }], { transaction });
      await transaction.commit();
      console.log(`Migration applied: ${migration.name}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  console.log("Database migrations complete.");
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });