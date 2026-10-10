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
    drawFrequency: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "SPECIFIC_DATE",
    },
    drawTime: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    drawDayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shortName: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logoPublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cardTheme: {
      type: DataTypes.STRING(24),
      allowNull: true,
    },
    primaryColor: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    secondaryColor: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    backgroundImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    winnerTicketId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    drawStatus: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: "SCHEDULED",
    },
    declaredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    declaredByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }
);

module.exports = Lottery;