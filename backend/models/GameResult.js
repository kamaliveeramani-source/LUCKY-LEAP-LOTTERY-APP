const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameResult = sequelize.define("GameResult", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  GameRoundId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: "game_rounds", key: "id" } },
  winningOptionId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "game_options", key: "id" } },
  winningValue: { type: DataTypes.STRING(120), allowNull: true },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "game_results", timestamps: true, indexes: [{ fields: ["published", "publishedAt"] }] });

module.exports = GameResult;
