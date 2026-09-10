const { DataTypes } = require("sequelize");

const definitions = [
  ["green-yellow-red", "GREEN_YELLOW_RED", "Green / Yellow / Red", "Games", "Choose a number from 0 to 9 and explore the configured colour divisions.", 1],
  ["cricket", "CRICKET", "Cricket", "Games", "Explore configured cricket competitions.", 2],
  ["golden-spin", "GOLDEN_SPIN", "Golden Spin", "Games", "Choose a number for Golden Spin.", 3],
  ["rummy", "RUMMY", "Rummy", "Games", "Choose a Rummy game option.", 4],
  ["poker", "POKER", "Poker", "Games", "Choose a Poker game option.", 5],
  ["abc-digit", "ABC_DIGIT", "ABC Digit", "Games", "Choose one of the configured ABC digit divisions.", 6],
];

module.exports = {
  name: "005-normalize-phase1-games",
  async up(queryInterface) {
    const table = await queryInterface.describeTable("game_definitions");
    for (const [column, type, defaultValue] of [["category", DataTypes.STRING(80), "Games"], ["displayOrder", DataTypes.INTEGER, 0], ["featured", DataTypes.BOOLEAN, false], ["image", DataTypes.TEXT, null]]) {
      if (!table[column]) await queryInterface.addColumn("game_definitions", column, { type, allowNull: column === "category" || column === "displayOrder" || column === "featured" ? false : true, defaultValue });
    }
    for (const [slug, type, name, category, description, displayOrder] of definitions) {
      await queryInterface.sequelize.query(`UPDATE game_definitions SET "type" = :type, "name" = :name, "category" = :category, "description" = :description, "displayOrder" = :displayOrder, "enabled" = TRUE, "featured" = FALSE, "updatedAt" = NOW() WHERE "slug" = :slug`, { replacements: { slug, type, name, category, description, displayOrder } });
    }
  },
};