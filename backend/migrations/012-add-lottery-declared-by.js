const { DataTypes } = require("sequelize");

module.exports = {
  name: "012-add-lottery-declared-by",

  async up(queryInterface) {
    const lotteryTable = await queryInterface.describeTable("Lotteries");
    if (!lotteryTable.declaredByUserId) {
      await queryInterface.addColumn("Lotteries", "declaredByUserId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Lotteries", "declaredByUserId");
  },
};
