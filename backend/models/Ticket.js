const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const User = require("./User");
const Lottery = require("./Lottery");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // SINGLE / DOUBLE / TRIPLE
    betType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "SINGLE",
    },

    // Example: 7, 27, 527
    selectedNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0",
    },

    // Bet amount
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // Winning amount
    winningAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // PENDING / WON / LOST
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },

    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },

    LotteryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lottery,
        key: "id",
      },
    },
  },
  {
    tableName: "Tickets",
    timestamps: true,
  }
);

// User → Tickets
User.hasMany(Ticket, {
  foreignKey: "UserId",
});

Ticket.belongsTo(User, {
  foreignKey: "UserId",
});

// Lottery → Tickets
Lottery.hasMany(Ticket, {
  foreignKey: "LotteryId",
});

Ticket.belongsTo(Lottery, {
  foreignKey: "LotteryId",
});

module.exports = Ticket;