const sequelize = require("../config/database");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const users = await User.findAll();
    for (const user of users) {
      const existing = await Wallet.findOne({ where: { UserId: user.id } });
      if (!existing) {
        const balance = Number(user.wallet) || 0;
        await Wallet.create({ UserId: user.id, balance });
        console.log(`Created wallet for user ${user.id} with balance ${balance}`);
      }
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
