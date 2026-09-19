const { DataTypes } = require("sequelize");

module.exports = {
  name: "010-allow-game-tickets-without-lottery",

  async up(queryInterface) {
    await queryInterface.changeColumn("Tickets", "LotteryId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Lotteries", key: "id" },
    });
  },
};