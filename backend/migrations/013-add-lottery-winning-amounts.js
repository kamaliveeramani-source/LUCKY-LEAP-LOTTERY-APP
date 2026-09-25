const { DataTypes } = require("sequelize");

module.exports = {
  name: "013-add-lottery-winning-amounts",

  async up(queryInterface) {
    const table = await queryInterface.describeTable("lottery_entry_amounts");
    const columns = {
      singleDigitWinningAmount: 100,
      doubleDigitWinningAmount: 500,
      tripleDigitWinningAmount: 10000,
    };
    for (const [column, defaultValue] of Object.entries(columns)) {
      if (!table[column]) {
        await queryInterface.addColumn("lottery_entry_amounts", column, {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue,
        });
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("lottery_entry_amounts", "tripleDigitWinningAmount");
    await queryInterface.removeColumn("lottery_entry_amounts", "doubleDigitWinningAmount");
    await queryInterface.removeColumn("lottery_entry_amounts", "singleDigitWinningAmount");
  },
};
