const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Wallet = sequelize.define("Wallet", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  bonus: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  winning: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  todaysEarnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  todaysBets: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalDeposit: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalWithdraw: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalWinning: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Wallet;

// Associations
try {
  const User = require("./User");
  Wallet.belongsTo(User, { foreignKey: "UserId" });
  if (User && typeof User.hasOne === "function") {
    User.hasOne(Wallet, { foreignKey: "UserId" });
  }
} catch (err) {
  // ignore if User model not yet available at require time
}
