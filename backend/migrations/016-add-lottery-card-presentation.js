const { DataTypes } = require("sequelize");

const columns = {
  shortName: { type: DataTypes.STRING(80), allowNull: true },
  logo: { type: DataTypes.TEXT, allowNull: true },
  logoPublicId: { type: DataTypes.STRING(255), allowNull: true },
  cardTheme: { type: DataTypes.STRING(24), allowNull: true },
  primaryColor: { type: DataTypes.STRING(16), allowNull: true },
  secondaryColor: { type: DataTypes.STRING(16), allowNull: true },
  backgroundImage: { type: DataTypes.TEXT, allowNull: true },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
};

const lotteryOrder = [
  ["Kerala Lottery", "purple", true],
  ["Win Win", "blue", false],
  ["Karunya", "green", false],
  ["Karunya Plus", "rose", false],
  ["Suvarna Kerala", "cyan", false],
  ["Samrudhi", "purple", false],
  ["Bhagyathara", "blue", false],
  ["Nagaland Day", "purple", false],
  ["Nagaland Evening", "orange", false],
  ["Akshaya", "magenta", false],
  ["Deer Lottery", "blue", false],
];

module.exports = {
  name: "016-add-lottery-card-presentation",

  async up(queryInterface, transaction) {
    const existing = await queryInterface.describeTable("Lotteries");
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing[name]) {
        await queryInterface.addColumn("Lotteries", name, definition, { transaction });
      }
    }

    await queryInterface.sequelize.query(
      'UPDATE "Lotteries" SET "displayOrder" = "id" WHERE "displayOrder" = 0',
      { transaction },
    );

    for (const [index, [lotteryName, cardTheme, featured]] of lotteryOrder.entries()) {
      await queryInterface.sequelize.query(
        `UPDATE "Lotteries"
         SET "displayOrder" = :displayOrder,
             "cardTheme" = COALESCE("cardTheme", :cardTheme),
             "featured" = CASE WHEN :featured THEN true ELSE "featured" END
         WHERE lower("lotteryName") = lower(:lotteryName)`,
        {
          replacements: { lotteryName, displayOrder: index + 1, cardTheme, featured },
          transaction,
        },
      );
    }
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