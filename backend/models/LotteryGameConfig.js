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
  subtitle: { type: DataTypes.STRING(120), allowNull: true },
  icon: { type: DataTypes.STRING(24), allowNull: true },
  buttonTheme: { type: DataTypes.STRING(24), allowNull: false, defaultValue: "purple" },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: "lottery_game_configs",
  timestamps: true,
});

module.exports = LotteryGameConfig;