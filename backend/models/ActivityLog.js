const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Lottery = require("./Lottery");
const Ticket = require("./Ticket");

const ActivityLog = sequelize.define("ActivityLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  result: { type: DataTypes.STRING, allowNull: false, defaultValue: "SUCCESS" },
  actorUserId: { type: DataTypes.INTEGER, allowNull: true },
  UserId: { type: DataTypes.INTEGER, allowNull: true },
  LotteryId: { type: DataTypes.INTEGER, allowNull: true },
  TicketId: { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

ActivityLog.belongsTo(User, { foreignKey: "actorUserId", as: "Actor" });
ActivityLog.belongsTo(User, { foreignKey: "UserId", as: "User" });
ActivityLog.belongsTo(Lottery, { foreignKey: "LotteryId", as: "Lottery" });
ActivityLog.belongsTo(Ticket, { foreignKey: "TicketId", as: "Ticket" });

module.exports = ActivityLog;
