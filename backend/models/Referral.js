const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Referral = sequelize.define(
  "Referral",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    referredUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    friendPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shareChannel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "LINK",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },
    rewardAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 250,
    },
    rewardCredited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rewardedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rewardReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["UserId", "friendPhone"],
      },
      {
        fields: ["referredUserId"],
      },
    ],
  }
);

Referral.belongsTo(User, { foreignKey: "UserId", as: "referrer" });
Referral.belongsTo(User, { foreignKey: "referredUserId", as: "referredUser" });
User.hasMany(Referral, { foreignKey: "UserId" });
User.hasMany(Referral, { foreignKey: "referredUserId", as: "referredInvites" });

module.exports = Referral;
