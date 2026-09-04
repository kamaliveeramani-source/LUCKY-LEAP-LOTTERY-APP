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

  username: {
    type: DataTypes.STRING,
    allowNull: true,
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
    allowNull: false,
    defaultValue: "USER",
    validate: {
      isIn: [["USER", "ADMIN"]],
    },
  }

}, {
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ["password"] }
  },
  scopes: {
    withPassword: { attributes: {} }
  }
});

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;