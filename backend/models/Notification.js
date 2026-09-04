const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  UserId: { type: DataTypes.INTEGER, allowNull: true },
  LotteryId: { type: DataTypes.INTEGER, allowNull: true },
  TicketId: { type: DataTypes.INTEGER, allowNull: true },
  actorUserId: { type: DataTypes.INTEGER, allowNull: true },
  eventKey: { type: DataTypes.STRING, allowNull: true, unique: true },
}, { timestamps: true });

Notification.belongsTo(User, { foreignKey: "UserId", as: "User" });
User.hasMany(Notification, { foreignKey: "UserId", as: "Notifications" });

module.exports = Notification;
