const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Lottery = require("./Lottery");

const WinningResult = sequelize.define("WinningResult", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  LotteryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Lottery, key: "id" },
  },
  betType: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  winningNumber: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  prizeAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(16),
    allowNull: false,
    defaultValue: "CONFIGURED",
  },
}, {
  tableName: "winning_results",
  timestamps: true,
});

Lottery.hasMany(WinningResult, { foreignKey: "LotteryId", as: "winningResults" });
WinningResult.belongsTo(Lottery, { foreignKey: "LotteryId", as: "lottery" });

module.exports = WinningResult;