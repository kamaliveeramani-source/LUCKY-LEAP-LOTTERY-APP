const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },

  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  wallet: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "user"
  }

}, {
  timestamps: true
});

module.exports = User;