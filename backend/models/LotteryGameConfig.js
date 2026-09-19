const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LotteryGameConfig = sequelize.define("LotteryGameConfig", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(180), allowNull: false, unique: true },
  ticketPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
  mainWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },
  bcWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: true, validate: { min: 0.01 } },
  cWinning: { type: DataTypes.DECIMAL(12, 2), allowNull: true, validate: { min: 0.01 } },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: "lottery_game_configs",
  timestamps: true,
});

module.exports = LotteryGameConfig;