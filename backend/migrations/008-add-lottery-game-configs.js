const { DataTypes } = require("sequelize");

const INITIAL_CONFIGS = [
  { name: "Kerala Lottery (A,B,C) Single Digit", ticketPrice: 11, mainWinning: 100, bcWinning: null, cWinning: null },
  { name: "Kerala Lottery Half (ABC) 3 Digital", ticketPrice: 25, mainWinning: 10000, bcWinning: 500, cWinning: 50 },
  { name: "Kerala Lottery (ABC) 3 Digital", ticketPrice: 55, mainWinning: 25000, bcWinning: 1000, cWinning: 100 },
  { name: "Kerala Lottery (DABC) 4 Digital", ticketPrice: 110, mainWinning: 50000, bcWinning: 2000, cWinning: 200 },
];

module.exports = {
  name: "008-add-lottery-game-configs",
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const exists = tables.some((table) => String(table).toLowerCase() === "lottery_game_configs");

    if (!exists) {
      await queryInterface.createTable("lottery_game_configs", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(180), allowNull: false, unique: true },
        ticketPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        mainWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        bcWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        cWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
    }

    const [rows] = await queryInterface.sequelize.query("SELECT name FROM lottery_game_configs");
    const existingNames = new Set(rows.map((row) => row.name));
    const now = new Date();
    const missing = INITIAL_CONFIGS
      .filter((config) => !existingNames.has(config.name))
      .map((config) => ({ ...config, isActive: true, createdAt: now, updatedAt: now }));

    if (missing.length) {
      await queryInterface.bulkInsert("lottery_game_configs", missing);
    }
  },
};