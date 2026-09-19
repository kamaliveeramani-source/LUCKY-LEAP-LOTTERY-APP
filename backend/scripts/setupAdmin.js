const path = require("path");
const dotenv = require("dotenv");

const envFilePath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envFilePath });

const sequelize = require("../config/database");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const normalizeRole = (role) => (String(role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "USER");

async function setupAdmin() {
  const hasAdminUsername = Boolean(process.env.ADMIN_USERNAME?.trim());
  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
  console.log(`Resolved working directory: ${process.cwd()}`);
  console.log(`Resolved env file path: ${envFilePath}`);
  console.log(`ADMIN_USERNAME configured: ${hasAdminUsername}`);
  console.log(`ADMIN_PASSWORD configured: ${hasAdminPassword}`);

  const username = String(process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.log("Admin setup skipped: ADMIN_USERNAME and ADMIN_PASSWORD are not configured.");
    return;
  }

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
      { username },
      process.env.ADMIN_USER_ID ? { id: Number(process.env.ADMIN_USER_ID) } : null,
      process.env.ADMIN_EMAIL ? { email: process.env.ADMIN_EMAIL } : null,
      process.env.ADMIN_MOBILE ? { mobile: process.env.ADMIN_MOBILE } : null,
    ].filter(Boolean);

    if (selectors.length > 1) {
      throw new Error("Set only one admin selector in ADMIN_USERNAME, ADMIN_USER_ID, ADMIN_EMAIL, or ADMIN_MOBILE.");
    }

    let admin = selectors.length === 1
      ? await User.findOne({ where: selectors[0], transaction, lock: transaction.LOCK.UPDATE })
      : await User.findOne({ where: { role: "ADMIN" }, transaction, lock: transaction.LOCK.UPDATE });

    if (!admin && selectors.length === 1 && selectors[0].username) {
      admin = await User.findOne({ where: { role: "ADMIN" }, transaction, lock: transaction.LOCK.UPDATE });
    }

    if (!admin) {
      const timestamp = Date.now();
      admin = await User.create({
        fullName: "Administrator",
        age: 18,
        gender: "OTHER",
        mobile: `admin${timestamp}`,
        username,
        email: `${username}${timestamp}@admin.local`,
        password: await bcrypt.hash(password, 12),
        wallet: 0,
        role: "ADMIN",
      }, { transaction });
      console.log(`Admin account created for user ID ${admin.id}`);
    } else {
      admin.username = username;
      admin.role = "ADMIN";
      admin.password = await bcrypt.hash(password, 12);
      await admin.save({ transaction });
      console.log(`Admin account ensured for user ID ${admin.id}`);
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