const { DataTypes } = require("sequelize");

const columns = {
  drawFrequency: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "SPECIFIC_DATE",
  },
  drawTime: { type: DataTypes.STRING(5), allowNull: true },
  drawDayOfWeek: { type: DataTypes.INTEGER, allowNull: true },
};

module.exports = {
  name: "018-add-lottery-draw-schedules",

  async up(queryInterface, transaction) {
    const existing = await queryInterface.describeTable("Lotteries");
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing[name]) {
        await queryInterface.addColumn("Lotteries", name, definition, { transaction });
      }
    }

    await queryInterface.sequelize.query(
      `UPDATE "Lotteries"
       SET "drawFrequency" = 'DAILY',
           "drawTime" = to_char("drawDate" AT TIME ZONE 'Asia/Kolkata', 'HH24:MI')
       WHERE "drawTime" IS NULL`,
      { transaction },
    );
  },

  async down(queryInterface, transaction) {
    const existing = await queryInterface.describeTable("Lotteries");
    for (const name of Object.keys(columns).reverse()) {
      if (existing[name]) {
        await queryInterface.removeColumn("Lotteries", name, { transaction });
      }
    }
  },
};