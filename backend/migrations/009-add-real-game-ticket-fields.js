const { DataTypes } = require("sequelize");

module.exports = {
  name: "009-add-real-game-ticket-fields",

  async up(queryInterface) {
    const table = await queryInterface.describeTable("Tickets");

    if (!table.GameDefinitionId) {
      await queryInterface.addColumn("Tickets", "GameDefinitionId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "game_definitions", key: "id" },
      });
    }
    if (!table.GameRoundId) {
      await queryInterface.addColumn("Tickets", "GameRoundId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "game_rounds", key: "id" },
      });
    }
    if (!table.stakeAmount) {
      await queryInterface.addColumn("Tickets", "stakeAmount", { type: DataTypes.DECIMAL(14, 2), allowNull: true });
    }
    if (!table.multiplier) {
      await queryInterface.addColumn("Tickets", "multiplier", { type: DataTypes.DECIMAL(10, 2), allowNull: true });
    }

    await queryInterface.addIndex("Tickets", ["UserId", "GameRoundId"], {
      unique: true,
      name: "tickets_user_game_round_uq",
    });
  },
};