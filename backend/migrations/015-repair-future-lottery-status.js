module.exports = {
  name: "015-repair-future-lottery-status",

  async up(queryInterface, transaction) {
    await queryInterface.sequelize.query(
      `UPDATE "Lotteries" AS lottery
       SET "drawStatus" = 'SCHEDULED',
           "winnerTicketId" = NULL,
           "declaredAt" = NULL,
           "declaredByUserId" = NULL
       WHERE lottery."isActive" = true
         AND lottery."drawDate" > CURRENT_TIMESTAMP
         AND (lottery."drawStatus" = 'COMPLETED' OR lottery."winnerTicketId" IS NOT NULL)
         AND NOT EXISTS (
           SELECT 1
           FROM "winning_results" AS result
           WHERE result."LotteryId" = lottery."id"
             AND result."status" = 'DECLARED'
         )`,
      { transaction }
    );
  },

  async down() {},
};