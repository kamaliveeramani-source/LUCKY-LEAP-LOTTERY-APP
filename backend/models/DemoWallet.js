const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DemoWallet = sequelize.define("DemoWallet", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: "Users", key: "id" },
  },
  balance: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  currency: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "DEMO_CREDITS" },
  status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "ACTIVE", validate: { isIn: [["ACTIVE", "INACTIVE"]] } },
}, { tableName: "demo_wallets", timestamps: true });

async function withTransaction(callback, transaction) {
  if (transaction) return callback(transaction);
  return sequelize.transaction(callback);
}

DemoWallet.getOrCreateForUser = async function getOrCreateForUser(UserId, options = {}) {
  return withTransaction(async (transaction) => {
    const [wallet] = await DemoWallet.findOrCreate({
      where: { UserId },
      defaults: { UserId, balance: 0, currency: "DEMO_CREDITS", status: "ACTIVE" },
      transaction,
    });
    return wallet;
  }, options.transaction);
};

DemoWallet.debit = async function debit(UserId, amount, options = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Demo debit amount must be greater than zero");
  return withTransaction(async (transaction) => {
    const wallet = await DemoWallet.findOne({ where: { UserId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!wallet || wallet.status !== "ACTIVE") throw new Error("Demo wallet is not available");
    if (Number(wallet.balance) < value) throw new Error("Insufficient demo credit balance");
    wallet.balance = (Number(wallet.balance) - value).toFixed(2);
    await wallet.save({ transaction });
    return wallet;
  }, options.transaction);
};

DemoWallet.credit = async function credit(UserId, amount, options = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Demo credit amount must be greater than zero");
  return withTransaction(async (transaction) => {
    const wallet = await DemoWallet.findOne({ where: { UserId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!wallet || wallet.status !== "ACTIVE") throw new Error("Demo wallet is not available");
    wallet.balance = (Number(wallet.balance) + value).toFixed(2);
    await wallet.save({ transaction });
    return wallet;
  }, options.transaction);
};

module.exports = DemoWallet;
