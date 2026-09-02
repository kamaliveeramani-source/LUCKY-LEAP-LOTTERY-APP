const { Sequelize } = require("sequelize");
require("dotenv").config();

const databaseOptions = {
  dialect: "postgres",
  logging: false,
};

const databaseUrl = process.env.DATABASE_URL;
const databaseHost = databaseUrl ? new URL(databaseUrl).hostname : "";

if (databaseUrl && !["localhost", "127.0.0.1"].includes(databaseHost)) {
  databaseOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, databaseOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...databaseOptions,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
      }
    );

module.exports = sequelize;