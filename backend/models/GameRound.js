const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameRound = sequelize.define("GameRound", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "game_definitions", key: "id" } },
  roundCode: { type: DataTypes.STRING(80), allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "OPEN", validate: { isIn: [["OPEN", "CLOSED", "CANCELLED"]] } },
  resultStatus: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "PENDING", validate: { isIn: [["PENDING", "PUBLISHED"]] } },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "game_rounds", timestamps: true, indexes: [{ unique: true, fields: ["GameDefinitionId", "roundCode"] }, { fields: ["GameDefinitionId", "status", "endTime"] }] });

module.exports = GameRound;
