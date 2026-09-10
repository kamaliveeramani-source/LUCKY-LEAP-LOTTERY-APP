const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameSelection = sequelize.define("GameSelection", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  UserId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" } },
  GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "game_definitions", key: "id" } },
  GameRoundId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "game_rounds", key: "id" } },
  GameOptionId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "game_options", key: "id" } },
  selectedValue: { type: DataTypes.STRING(120), allowNull: true },
  stakeAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0, validate: { min: 0.01 } },
  multiplier: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1, validate: { min: 1 } },
  demoAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, validate: { min: 0.01 } },
  status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "PENDING", validate: { isIn: [["PENDING", "WON", "LOST", "CANCELLED"]] } },
}, { tableName: "game_selections", timestamps: true, indexes: [{ unique: true, fields: ["UserId", "GameRoundId"] }, { fields: ["GameDefinitionId", "GameRoundId"] }, { fields: ["UserId", "createdAt"] }] });

module.exports = GameSelection;
