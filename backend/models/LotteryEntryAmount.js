const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DEFAULTS = {
  singleDigitAmount: 10,
  doubleDigitAmount: 20,
  tripleDigitAmount: 30,
};

const LotteryEntryAmount = sequelize.define(
  "LotteryEntryAmount",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    singleDigitAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: DEFAULTS.singleDigitAmount,
    },
    doubleDigitAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: DEFAULTS.doubleDigitAmount,
    },
    tripleDigitAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: DEFAULTS.tripleDigitAmount,
    },
  },
  {
    tableName: "lottery_entry_amounts",
    timestamps: true,
  }
);

function toPublic(record) {
  return {
    singleDigitAmount: Number(record?.singleDigitAmount ?? DEFAULTS.singleDigitAmount),
    doubleDigitAmount: Number(record?.doubleDigitAmount ?? DEFAULTS.doubleDigitAmount),
    tripleDigitAmount: Number(record?.tripleDigitAmount ?? DEFAULTS.tripleDigitAmount),
  };
}

LotteryEntryAmount.getConfig = async function getConfig(options = {}) {
  const [record] = await LotteryEntryAmount.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, ...DEFAULTS },
    ...options,
  });
  return record;
};

LotteryEntryAmount.toPublic = toPublic;
LotteryEntryAmount.DEFAULTS = DEFAULTS;

module.exports = LotteryEntryAmount;
