module.exports = {
  name: "011-drop-lottery-required-for-game-tickets",

  async up(queryInterface, transaction) {
    await queryInterface.sequelize.query('ALTER TABLE "Tickets" ALTER COLUMN "LotteryId" DROP NOT NULL', { transaction });
  },
};