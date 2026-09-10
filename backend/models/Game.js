const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Game", {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: true, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  image: { type: DataTypes.TEXT, allowNull: true },
  imagePublicId: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: false },
  gameType: { type: DataTypes.STRING, allowNull: false },
  configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "ACTIVE", validate: { isIn: [["ACTIVE", "INACTIVE"]] } },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: "games" });
