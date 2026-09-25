const { Op } = require("sequelize");

const sequelize = require("../config/database");
const Lottery = require("../models/Lottery");

const REQUIRED_LOTTERIES = [
  "Kerala Lottery",
  "Win Win",
  "Akshaya",
  "Karunya",
  "Karunya Plus",
  "Suvarna Kerala",
  "Samrudhi",
  "Bhagyathara",
  "Nagaland Day",
  "Nagaland Evening",
  "Deer Lottery",
];

const normalizeLotteryName = (name) =>
  String(name || "").trim().toLowerCase();

/**
 * Restore Akshaya lottery if it is missing.
 */
async function restoreAkshaya() {
  const transaction = await sequelize.transaction();

  try {
    const akshayaRows = await Lottery.findAll({
      where: {
        lotteryName: {
          [Op.iLike]: "Akshaya",
        },
      },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (akshayaRows.length > 1) {
      throw new Error(
        `Found ${akshayaRows.length} Akshaya records; refusing to create or remove duplicates automatically.`
      );
    }

    if (akshayaRows.length === 1) {
      await transaction.commit();
      return akshayaRows[0];
    }

    const legacyRows = await Lottery.findAll({
      where: {
        lotteryName: {
          [Op.iLike]: "Kerala Lottery",
        },
      },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (legacyRows.length > 1) {
      throw new Error(
        `Found ${legacyRows.length} legacy Kerala Lottery records; refusing to choose a replacement automatically.`
      );
    }

    if (legacyRows.length === 1) {
      legacyRows[0].lotteryName = "Akshaya";

      await legacyRows[0].save({
        transaction,
      });

      await transaction.commit();
      return legacyRows[0];
    }

    const nextDraw = new Date();

    nextDraw.setHours(15, 0, 0, 0);
    nextDraw.setDate(nextDraw.getDate() + 1);

    const created = await Lottery.create(
      {
        lotteryName: "Akshaya",
        ticketPrice: 100,
        firstPrize: 700000,
        secondPrize: 350000,
        thirdPrize: 80000,
        totalTickets: 5000,
        drawDate: nextDraw,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return created;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Validate all required lotteries.
 */
async function validateLotteries() {
  const lotteries = await Lottery.findAll({
    order: [["id", "ASC"]],
  });

  const names = lotteries.map((lottery) => lottery.lotteryName);

  const missing = REQUIRED_LOTTERIES.filter(
    (requiredName) =>
      !names.some(
        (actualName) =>
          normalizeLotteryName(actualName) ===
          normalizeLotteryName(requiredName)
      )
  );

  if (missing.length > 0) {
    throw new Error(
      `Required lotteries are missing: ${missing.join(", ")}`
    );
  }

  const uniqueIds = new Set(lotteries.map((lottery) => lottery.id));

  if (uniqueIds.size !== lotteries.length) {
    throw new Error("Lottery IDs are not unique.");
  }

  return lotteries;
}

/**
 * Ensure all required lotteries exist.
 *
 * Existing lotteries:
 * - Keep their existing IDs.
 * - Update their names if required.
 * - Update their draw dates to upcoming scheduled dates.
 *
 * Missing lotteries:
 * - Create automatically.
 */
async function ensureAllLotteries() {
  const transaction = await sequelize.transaction();

  try {
    const existing = await Lottery.findAll({
      transaction,
      lock: transaction.LOCK.UPDATE,
      order: [["id", "ASC"]],
    });

    const primaryLottery = existing.find(
      (lottery) => Number(lottery.id) === 1
    );

    if (
      primaryLottery &&
      /^(kerala\s+bumper|kerala\s+lottery)$/i.test(
        primaryLottery.lotteryName
      )
    ) {
      primaryLottery.lotteryName = "Kerala Lottery";

      await primaryLottery.save({
        transaction,
      });
    }

    const refreshed = await Lottery.findAll({
      transaction,
      lock: transaction.LOCK.UPDATE,
      order: [["id", "ASC"]],
    });

    const requiredNames = new Set(
      REQUIRED_LOTTERIES.map(normalizeLotteryName)
    );

    const existingByName = new Map();

    for (const lottery of refreshed) {
      const normalizedName = normalizeLotteryName(
        lottery.lotteryName
      );

      if (
        requiredNames.has(normalizedName) &&
        existingByName.has(normalizedName)
      ) {
        throw new Error(
          `Found duplicate lottery records for ${lottery.lotteryName}; refusing to remove records automatically.`
        );
      }

      if (requiredNames.has(normalizedName)) {
        existingByName.set(normalizedName, lottery);
      }
    }

    /**
     * Scheduled draw times:
     *
     * Day 0:
     * - 01:00 PM
     * - 06:00 PM
     * - 06:30 PM
     *
     * Day 1:
     * - 01:00 PM
     * - 06:00 PM
     * - 06:30 PM
     *
     * And so on.
     */
    const drawTimes = [
      {
        hours: 13,
        minutes: 0,
      },
      {
        hours: 18,
        minutes: 0,
      },
      {
        hours: 18,
        minutes: 30,
      },
    ];

    for (let i = 0; i < REQUIRED_LOTTERIES.length; i++) {
      const lotteryName = REQUIRED_LOTTERIES[i];
      const normalizedName = normalizeLotteryName(lotteryName);

      const existingLottery = existingByName.get(normalizedName);

      const dayOffset = Math.floor(i / drawTimes.length);
      const timeIndex = i % drawTimes.length;
      const drawTime = drawTimes[timeIndex];

      /**
       * Create an upcoming draw date.
       */
      const drawDate = new Date();

      drawDate.setDate(drawDate.getDate() + dayOffset);
      drawDate.setHours(
        drawTime.hours,
        drawTime.minutes,
        0,
        0
      );

      /**
       * If the scheduled time for today has already passed,
       * move this lottery to the next available day.
       */
      const now = new Date();

      if (drawDate.getTime() <= now.getTime()) {
        drawDate.setDate(drawDate.getDate() + 1);
      }

      /**
       * Update an existing lottery.
       */
      if (existingLottery && existingLottery.id) {
        const currentDrawDate = existingLottery.drawDate
          ? new Date(existingLottery.drawDate)
          : null;

        const currentDateIsValid =
          currentDrawDate &&
          !Number.isNaN(currentDrawDate.getTime());

        const shouldUpdateDate =
          !currentDateIsValid ||
          currentDrawDate.getTime() !== drawDate.getTime();

        if (shouldUpdateDate) {
          existingLottery.drawDate = drawDate;

          await existingLottery.save({
            transaction,
          });

          console.log(
            `✓ Updated lottery: ${lotteryName} | Draw: ${drawDate.toLocaleString()}`
          );
        } else {
          console.log(
            `✓ Lottery already scheduled: ${lotteryName} | Draw: ${drawDate.toLocaleString()}`
          );
        }

        continue;
      }

      /**
       * Create a missing lottery.
       */
      const createdLottery = await Lottery.create(
        {
          lotteryName,
          ticketPrice: 10.5,
          firstPrize: 100,
          secondPrize: 50,
          thirdPrize: 20,
          totalTickets: 1000,
          drawDate,
        },
        {
          transaction,
        }
      );

      existingByName.set(normalizedName, createdLottery);

      console.log(
        `✓ Created lottery: ${lotteryName} | Draw: ${drawDate.toLocaleString()}`
      );
    }

    await transaction.commit();

    console.log("✅ All required lotteries ensured and scheduled.");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Main seed function.
 */
async function main() {
  await sequelize.authenticate();

  console.log("✅ Database connection established.");

  await ensureAllLotteries();

  const lotteries = await validateLotteries();

  console.log(
    `📋 Lottery database has ${lotteries.length} draws:`
  );

  console.table(
    lotteries.map((lottery) => ({
      id: lottery.id,
      lotteryName: lottery.lotteryName,
      drawDate: lottery.drawDate
        ? new Date(lottery.drawDate).toLocaleString()
        : "Not scheduled",
    }))
  );
}

main()
  .catch((error) => {
    console.error(
      "❌ Lottery seed failed:",
      error.message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });