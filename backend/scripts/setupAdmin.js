const sequelize = require("../config/database");
const User = require("../models/User");

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
      process.env.ADMIN_USER_ID ? { id: Number(process.env.ADMIN_USER_ID) } : null,
      process.env.ADMIN_EMAIL ? { email: process.env.ADMIN_EMAIL } : null,
      process.env.ADMIN_MOBILE ? { mobile: process.env.ADMIN_MOBILE } : null,
    ].filter(Boolean);

    if (selectors.length > 1) {
      throw new Error("Set only one of ADMIN_USER_ID, ADMIN_EMAIL, or ADMIN_MOBILE.");
    }

    if (selectors.length === 1) {
      const admin = await User.findOne({ where: selectors[0], transaction, lock: transaction.LOCK.UPDATE });
      if (!admin) {
        throw new Error("Configured admin account was not found; no account was promoted.");
      }

      admin.role = "ADMIN";
      await admin.save({ transaction });
      console.log(`Admin role ensured for existing user ID ${admin.id}`);
    } else {
      console.log("No admin selector configured; existing users remain USER.");
    }

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