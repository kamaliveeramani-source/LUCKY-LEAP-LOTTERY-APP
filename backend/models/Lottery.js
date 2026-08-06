const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lottery = sequelize.define("Lottery", {
    lotteryName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    firstPrize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    secondPrize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    thirdPrize: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalTickets: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    drawDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    winnerTicketId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }
);

module.exports = Lottery;