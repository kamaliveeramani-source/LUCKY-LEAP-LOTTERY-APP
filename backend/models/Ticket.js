const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./User");
const Lottery = require("./Lottery");

const Ticket = sequelize.define("Ticket", {
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

// Relationships
User.hasMany(Ticket);
Ticket.belongsTo(User);

Lottery.hasMany(Ticket);
Ticket.belongsTo(Lottery);

module.exports = Ticket;