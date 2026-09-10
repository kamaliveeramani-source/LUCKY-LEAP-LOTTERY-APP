const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GAME_TYPES = ["GREEN_YELLOW_RED", "GOLDEN_SPIN", "DIGIT_ABC", "ABC_DIGIT", "CRICKET", "RUMMY", "POKER", "RUMMY_DEMO", "POKER_DEMO"];

const GameDefinition = sequelize.define("GameDefinition", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  slug: { type: DataTypes.STRING(140), allowNull: false, unique: true },
  type: { type: DataTypes.STRING(32), allowNull: false, validate: { isIn: [GAME_TYPES] } },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  category: { type: DataTypes.STRING(80), allowNull: false, defaultValue: "Games" },
  image: { type: DataTypes.TEXT, allowNull: true },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: "game_definitions", timestamps: true });

GameDefinition.GAME_TYPES = GAME_TYPES;
module.exports = GameDefinition;
