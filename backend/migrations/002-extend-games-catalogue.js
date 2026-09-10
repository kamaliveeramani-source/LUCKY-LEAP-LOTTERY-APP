const { DataTypes } = require("sequelize");

module.exports = {
  name: "002-extend-games-catalogue",
  async up(queryInterface) {
    const table = await queryInterface.describeTable("games");
    if (!table.slug) await queryInterface.addColumn("games", "slug", { type: DataTypes.STRING(140), allowNull: true });
    if (!table.configuration) await queryInterface.addColumn("games", "configuration", { type: DataTypes.JSONB, allowNull: false, defaultValue: {} });
    await queryInterface.sequelize.query("UPDATE games SET slug = CONCAT('legacy-game-', id) WHERE slug IS NULL OR slug = ''");
    await queryInterface.addIndex("games", ["slug"], { unique: true, name: "games_slug_uq" }).catch(() => {});
    await queryInterface.addIndex("games", ["status", "displayOrder", "id"], { name: "games_catalogue_order_idx" }).catch(() => {});
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("games", "configuration");
    await queryInterface.removeColumn("games", "slug");
  },
};