const sequelize = require("../config/database");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const normalizeRole = (role) => (String(role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "USER");

async function setupAdmin() {
  await sequelize.sync({ alter: true });
  const transaction = await sequelize.transaction();

  try {
    const users = await User.findAll({ transaction, lock: transaction.LOCK.UPDATE });

    for (const user of users) {
      const role = normalizeRole(user.role);
      if (user.role !== role) {
        user.role = role;
        await user.save({ transaction });
      }
    }

    const selectors = [
      process.env.ADMIN_USERNAME ? { username: process.env.ADMIN_USERNAME } : null,
      process.env.ADMIN_USER_ID ? { id: Number(process.env.ADMIN_USER_ID) } : null,
      process.env.ADMIN_EMAIL ? { email: process.env.ADMIN_EMAIL } : null,
      process.env.ADMIN_MOBILE ? { mobile: process.env.ADMIN_MOBILE } : null,
    ].filter(Boolean);

    if (selectors.length > 1) {
      throw new Error("Set only one admin selector in ADMIN_USERNAME, ADMIN_USER_ID, ADMIN_EMAIL, or ADMIN_MOBILE.");
    }

    const admin = selectors.length === 1
      ? await User.findOne({ where: selectors[0], transaction, lock: transaction.LOCK.UPDATE })
      : await User.findOne({ where: { role: "ADMIN" }, transaction, lock: transaction.LOCK.UPDATE });

    if (!admin) {
      throw new Error("No admin account found; configure ADMIN_USERNAME or an existing admin selector.");
    }

    admin.username = process.env.ADMIN_USERNAME || "admin";
    admin.role = "ADMIN";
    admin.password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin@123", 12);
    await admin.save({ transaction });
    console.log(`Admin account ensured for user ID ${admin.id}`);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

setupAdmin()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });