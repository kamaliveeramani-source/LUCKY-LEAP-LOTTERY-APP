const { DataTypes } = require("sequelize");

module.exports = {
  name: "004-add-winning-results",

  async up(queryInterface) {
    const lotteryTable = await queryInterface.describeTable("Lotteries");
    if (!lotteryTable.drawStatus) {
      await queryInterface.addColumn("Lotteries", "drawStatus", {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: "SCHEDULED",
      });
    }
    if (!lotteryTable.declaredAt) {
      await queryInterface.addColumn("Lotteries", "declaredAt", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(
      'UPDATE "Lotteries" SET "drawStatus" = \'COMPLETED\' WHERE "winnerTicketId" IS NOT NULL'
    );

    const tables = await queryInterface.showAllTables();
    if (!tables.some((table) => String(table).toLowerCase() === "winning_results")) {
      await queryInterface.createTable("winning_results", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        LotteryId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Lotteries", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
        betType: { type: DataTypes.STRING(16), allowNull: false },
        winningNumber: { type: DataTypes.STRING(3), allowNull: false },
        prizeAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "CONFIGURED" },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("winning_results", ["LotteryId", "betType"], { unique: true, name: "winning_results_lottery_bet_type_uq" });
      await queryInterface.addIndex("winning_results", ["LotteryId", "status"], { name: "winning_results_lottery_status_idx" });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("winning_results");
    await queryInterface.removeColumn("Lotteries", "declaredAt");
    await queryInterface.removeColumn("Lotteries", "drawStatus");
  },
};