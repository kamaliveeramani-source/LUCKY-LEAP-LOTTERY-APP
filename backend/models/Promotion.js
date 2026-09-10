const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Promotion", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  image: { type: DataTypes.TEXT, allowNull: true },
  imagePublicId: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "ACTIVE", validate: { isIn: [["ACTIVE", "INACTIVE"]] } },
  featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: "promotions" });
