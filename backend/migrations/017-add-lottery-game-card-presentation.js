const { DataTypes } = require("sequelize");

const columns = {
  subtitle: { type: DataTypes.STRING(120), allowNull: true },
  icon: { type: DataTypes.STRING(24), allowNull: true },
  buttonTheme: { type: DataTypes.STRING(24), allowNull: false, defaultValue: "purple" },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
};

const defaults = [
  ["Kerala Lottery (A,B,C) Single Digit", "Single Digit", "ABC", "purple"],
  ["Kerala Lottery Half (ABC) 3 Digital", "3 Digital", "1/2", "orange"],
  ["Kerala Lottery (ABC) 3 Digital", "3 Digital", "3D", "green"],
  ["Kerala Lottery (DABC) 4 Digital", "4 Digital", "4D", "purple"],
];

module.exports = {
  name: "017-add-lottery-game-card-presentation",

  async up(queryInterface, transaction) {
    const existing = await queryInterface.describeTable("lottery_game_configs");
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing[name]) await queryInterface.addColumn("lottery_game_configs", name, definition, { transaction });
    }
    for (const [index, [name, subtitle, icon, buttonTheme]] of defaults.entries()) {
      await queryInterface.sequelize.query(
        `UPDATE lottery_game_configs
         SET subtitle = COALESCE(subtitle, :subtitle),
             icon = COALESCE(icon, :icon),
           "buttonTheme" = COALESCE("buttonTheme", :buttonTheme),
           "displayOrder" = CASE WHEN "displayOrder" = 0 THEN :displayOrder ELSE "displayOrder" END
         WHERE name = :name`,
        { replacements: { name, subtitle, icon, buttonTheme, displayOrder: index + 1 }, transaction },
      );
    }
    await queryInterface.sequelize.query(
      'UPDATE lottery_game_configs SET "displayOrder" = id WHERE "displayOrder" = 0',
      { transaction },
    );
  },

  async down(queryInterface, transaction) {
    const existing = await queryInterface.describeTable("lottery_game_configs");
    for (const name of Object.keys(columns).reverse()) {
      if (existing[name]) await queryInterface.removeColumn("lottery_game_configs", name, { transaction });
    }
  },
};