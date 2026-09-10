const { DataTypes } = require("sequelize");

module.exports = {
  name: "006-add-demo-selection-pricing",
  async up(queryInterface) {
    const table = await queryInterface.describeTable("game_selections");
    if (!table.stakeAmount) await queryInterface.addColumn("game_selections", "stakeAmount", { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 });
    if (!table.multiplier) await queryInterface.addColumn("game_selections", "multiplier", { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 });
  },
};