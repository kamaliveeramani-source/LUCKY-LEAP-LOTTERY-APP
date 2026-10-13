const { Op } = require("sequelize");

const sequelize = require("../config/database");
const Lottery = require("../models/Lottery");
const {
  getZonedParts,
  zonedDateTimeToDate,
  dateKeyAfterDays,
} = require("../utils/drawStatus");

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

const LOTTERY_THEMES = [
  "purple",
  "blue",
  "magenta",
  "green",
  "rose",
  "cyan",
  "purple",
  "blue",
  "purple",
  "orange",
  "blue",
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

    const now = new Date();
    const todayParts = getZonedParts(now, "Asia/Kolkata");
    const todayKey = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
    let nextDraw = zonedDateTimeToDate(dateKeyAfterDays(todayKey, 1), "15:00", "Asia/Kolkata");
    if (!nextDraw || nextDraw.getTime() <= now.getTime()) {
      nextDraw = zonedDateTimeToDate(dateKeyAfterDays(todayKey, 2), "15:00", "Asia/Kolkata");
    }

    if (legacyRows.length === 1) {
      legacyRows[0].lotteryName = "Akshaya";
      legacyRows[0].shortName = "AK";
      legacyRows[0].cardTheme = "magenta";
      legacyRows[0].displayOrder = 10;
      legacyRows[0].featured = false;
      legacyRows[0].drawFrequency = "DAILY";
      legacyRows[0].drawTime = "15:00";
      legacyRows[0].isActive = true;
      if (!legacyRows[0].drawDate || new Date(legacyRows[0].drawDate).getTime() <= now.getTime()) {
        legacyRows[0].drawDate = nextDraw;
      }

      await legacyRows[0].save({
        transaction,
      });

      await transaction.commit();
      return legacyRows[0];
    }

    const created = await Lottery.create(
      {
        lotteryName: "Akshaya",
        shortName: "AK",
        cardTheme: "magenta",
        displayOrder: 10,
        featured: false,
        ticketPrice: 100,
        firstPrize: 700000,
        secondPrize: 350000,
        thirdPrize: 80000,
        totalTickets: 5000,
        drawDate: nextDraw,
        drawFrequency: "DAILY",
        drawTime: "15:00",
        isActive: true,
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
        time: "13:00",
      },
      {
        hours: 18,
        minutes: 0,
        time: "18:00",
      },
      {
        hours: 18,
        minutes: 30,
        time: "18:30",
      },
    ];

    const now = new Date();
    const todayParts = getZonedParts(now, "Asia/Kolkata");
    const todayKey = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;

    for (let i = 0; i < REQUIRED_LOTTERIES.length; i++) {
      const lotteryName = REQUIRED_LOTTERIES[i];
      const normalizedName = normalizeLotteryName(lotteryName);

      const existingLottery = existingByName.get(normalizedName);

      const dayOffset = Math.floor(i / drawTimes.length);
      const timeIndex = i % drawTimes.length;
      const defaultDrawTime = drawTimes[timeIndex];
      const timeString = (existingLottery?.drawTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(existingLottery.drawTime))
        ? existingLottery.drawTime
        : defaultDrawTime.time;

      /**
       * Create an upcoming draw date anchored in Indian Standard Time (Asia/Kolkata).
       */
      let targetDateKey = dateKeyAfterDays(todayKey, dayOffset);
      let drawDate = zonedDateTimeToDate(targetDateKey, timeString, "Asia/Kolkata");

      if (!drawDate || drawDate.getTime() <= now.getTime()) {
        targetDateKey = dateKeyAfterDays(todayKey, dayOffset + 1);
        drawDate = zonedDateTimeToDate(targetDateKey, timeString, "Asia/Kolkata");
      }

      /**
       * Update an existing lottery.
       */
      if (existingLottery && existingLottery.id) {
        const currentDrawDate = existingLottery.drawDate
          ? new Date(existingLottery.drawDate)
          : null;

        const currentDateValidAndFuture =
          currentDrawDate &&
          !Number.isNaN(currentDrawDate.getTime()) &&
          currentDrawDate.getTime() > now.getTime();

        let shouldUpdate = false;

        if (!currentDateValidAndFuture) {
          existingLottery.drawDate = drawDate;
          shouldUpdate = true;
        }

        if (existingLottery.drawFrequency !== "DAILY") {
          existingLottery.drawFrequency = "DAILY";
          shouldUpdate = true;
        }

        if (!existingLottery.drawTime) {
          existingLottery.drawTime = timeString;
          shouldUpdate = true;
        }

        if (existingLottery.isActive !== true) {
          existingLottery.isActive = true;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          await existingLottery.save({
            transaction,
          });

          console.log(
            `✓ Updated lottery schedule: ${lotteryName} | Draw: ${existingLottery.drawDate.toISOString()} | Time: ${timeString} IST`
          );
        } else {
          console.log(
            `✓ Lottery already scheduled: ${lotteryName} | Draw: ${existingLottery.drawDate.toISOString()} | Time: ${existingLottery.drawTime} IST`
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
          shortName: lotteryName === "Deer Lottery" ? "DL" : null,
          cardTheme: LOTTERY_THEMES[i],
          displayOrder: i + 1,
          featured: i === 0,
          ticketPrice: 10.5,
          firstPrize: 100,
          secondPrize: 50,
          thirdPrize: 20,
          totalTickets: 1000,
          drawDate,
          drawFrequency: "DAILY",
          drawTime: timeString,
          isActive: true,
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