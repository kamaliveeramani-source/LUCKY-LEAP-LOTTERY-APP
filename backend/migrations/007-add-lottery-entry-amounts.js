const { DataTypes } = require("sequelize");

module.exports = {
  name: "007-add-lottery-entry-amounts",
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const exists = tables.some((table) => String(table).toLowerCase() === "lottery_entry_amounts");
    if (!exists) {
      await queryInterface.createTable("lottery_entry_amounts", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        singleDigitAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 10 },
        doubleDigitAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 20 },
        tripleDigitAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 30 },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
    }
    const [rows] = await queryInterface.sequelize.query("SELECT id FROM lottery_entry_amounts WHERE id = 1");
    if (!rows?.length) {
      const now = new Date();
      await queryInterface.bulkInsert("lottery_entry_amounts", [{
        id: 1,
        singleDigitAmount: 10,
        doubleDigitAmount: 20,
        tripleDigitAmount: 30,
        createdAt: now,
        updatedAt: now,
      }]);
    }
  },
};
