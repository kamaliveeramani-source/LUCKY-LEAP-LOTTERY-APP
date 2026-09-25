module.exports = {
  name: "014-align-upcoming-draw-times",

  async up(queryInterface, transaction) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT "id", "lotteryName", "declaredAt", "winnerTicketId"
       FROM "Lotteries"
       WHERE "isActive" = true
         AND "lotteryName" NOT ILIKE '%demo%'
         AND "lotteryName" NOT ILIKE '%test%'
       ORDER BY "id" ASC`,
      { transaction }
    );

    const candidates = rows.filter(
      (row) =>
        row.winnerTicketId === null &&
        row.declaredAt === null
    );

    const named = (name) =>
      candidates.find(
        (row) =>
          row.lotteryName.trim().toLowerCase() ===
          name.toLowerCase()
      );

    const selected = [
      named("Karunya"),
      named("Deer Lottery"),
      named("Akshaya"),
    ].filter(Boolean);

    if (selected.length < 3) {
      console.warn(
        "⚠️ Upcoming lottery records are not available yet. Skipping draw-time alignment; seed will ensure the required lotteries."
      );
      return;
    }

    const now = new Date();

    const drawTimes = [
      [13, 0],
      [18, 0],
      [18, 30],
    ];

    const firstDraw = new Date(now);

    firstDraw.setHours(
      drawTimes[0][0],
      drawTimes[0][1],
      0,
      0
    );

    if (firstDraw <= now) {
      firstDraw.setDate(firstDraw.getDate() + 1);
    }

    for (let index = 0; index < selected.length; index += 1) {
      const drawDate = new Date(firstDraw);

      drawDate.setHours(
        drawTimes[index][0],
        drawTimes[index][1],
        0,
        0
      );

      await queryInterface.sequelize.query(
        `UPDATE "Lotteries"
         SET
           "drawDate" = :drawDate,
           "drawStatus" = 'SCHEDULED'
         WHERE "id" = :id`,
        {
          replacements: {
            drawDate,
            id: selected[index].id,
          },
          transaction,
        }
      );
    }
  },

  async down() {},
};