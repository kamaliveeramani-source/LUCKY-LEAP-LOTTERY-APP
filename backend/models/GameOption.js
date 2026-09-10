const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameOption = sequelize.define("GameOption", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "game_definitions", key: "id" } },
  key: { type: DataTypes.STRING(80), allowNull: false },
  label: { type: DataTypes.STRING(120), allowNull: false },
  value: { type: DataTypes.STRING(80), allowNull: true },
  colour: { type: DataTypes.STRING(32), allowNull: true },
  category: { type: DataTypes.STRING(80), allowNull: true },
  multiplier: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: "game_options", timestamps: true, indexes: [{ unique: true, fields: ["GameDefinitionId", "key"] }, { fields: ["GameDefinitionId", "enabled"] }] });

module.exports = GameOption;
