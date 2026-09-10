const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameActivity = sequelize.define("GameActivity", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: { type: DataTypes.STRING(64), allowNull: false },
  title: { type: DataTypes.STRING(160), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  result: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "SUCCESS" },
  actorUserId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "Users", key: "id" } },
  UserId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "Users", key: "id" } },
  GameDefinitionId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "game_definitions", key: "id" } },
  GameRoundId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "game_rounds", key: "id" } },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, { tableName: "game_activities", timestamps: true, indexes: [{ fields: ["GameDefinitionId", "createdAt"] }, { fields: ["GameRoundId", "createdAt"] }, { fields: ["UserId", "createdAt"] }] });

module.exports = GameActivity;
