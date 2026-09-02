const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");

const REQUIRED_LOTTERIES = [
  "Kerala Bumper",
  "Win Win",
  "Akshaya",
  "Karunya",
  "Karunya Plus",
  "Suvarna Kerala",
  "Samrudhi",
  "Bhagyathara",
  "Nagaland Day",
  "Nagaland Evening",
];

async function restoreAkshaya() {
  const transaction = await sequelize.transaction();

  try {
    const akshayaRows = await Lottery.findAll({
      where: { lotteryName: { [Op.iLike]: "Akshaya" } },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (akshayaRows.length > 1) {
      throw new Error(`Found ${akshayaRows.length} Akshaya records; refusing to create or remove duplicates automatically.`);
    }

    if (akshayaRows.length === 1) {
      await transaction.commit();
      return akshayaRows[0];
    }

    const legacyRows = await Lottery.findAll({
      where: { lotteryName: { [Op.iLike]: "Kerala Lottery" } },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (legacyRows.length > 1) {
      throw new Error(`Found ${legacyRows.length} legacy Kerala Lottery records; refusing to choose a replacement automatically.`);
    }

    if (legacyRows.length === 1) {
      legacyRows[0].lotteryName = "Akshaya";
      await legacyRows[0].save({ transaction });
      await transaction.commit();
      return legacyRows[0];
    }

    const nextDraw = new Date();
    nextDraw.setUTCHours(15, 0, 0, 0);
    nextDraw.setUTCDate(nextDraw.getUTCDate() + 1);

    const created = await Lottery.create({
      lotteryName: "Akshaya",
      ticketPrice: 100,
      firstPrize: 700000,
      secondPrize: 350000,
      thirdPrize: 80000,
      totalTickets: 5000,
      drawDate: nextDraw,
    }, { transaction });

    await transaction.commit();
    return created;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function validateLotteries() {
  const lotteries = await Lottery.findAll({
    order: [["id", "ASC"]],
  });
  const names = lotteries.map((lottery) => lottery.lotteryName);
  const expected = [...REQUIRED_LOTTERIES].sort();
  const actual = [...names].sort();

  if (lotteries.length !== REQUIRED_LOTTERIES.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Lottery set is invalid. Expected exactly: ${REQUIRED_LOTTERIES.join(", ")}. Actual: ${names.join(", ")}`);
  }

  const uniqueIds = new Set(lotteries.map((lottery) => lottery.id));
  if (uniqueIds.size !== lotteries.length) {
    throw new Error("Lottery IDs are not unique.");
  }

  return lotteries;
}

async function ensureAllLotteries() {
  const transaction = await sequelize.transaction();
  
  try {
    const existing = await Lottery.findAll({
      transaction,
      lock: transaction.LOCK.UPDATE,
      order: [["id", "ASC"]],
    });
    const primaryLottery = existing.find((lottery) => lottery.id === 1);

    if (primaryLottery && /^(kerala bumper|kerala lottery)$/i.test(primaryLottery.lotteryName)) {
      primaryLottery.lotteryName = "Kerala Bumper";
      await primaryLottery.save({ transaction });
    }

    const refreshed = await Lottery.findAll({ transaction, order: [["id", "ASC"]] });
    const requiredNames = new Set(REQUIRED_LOTTERIES.map((name) => name.toLowerCase()));
    const existingByName = new Map();

    for (const lottery of refreshed) {
      const normalizedName = lottery.lotteryName.toLowerCase();
      if (!requiredNames.has(normalizedName)) {
        const ticketCount = await Ticket.count({ where: { LotteryId: lottery.id }, transaction });
        if (ticketCount > 0) {
          throw new Error(`Cannot remove lottery ${lottery.id} (${lottery.lotteryName}); ${ticketCount} tickets are linked to it.`);
        }
        await lottery.destroy({ transaction });
        continue;
      }

      if (existingByName.has(normalizedName)) {
        throw new Error(`Found duplicate lottery records for ${lottery.lotteryName}; refusing to remove records automatically.`);
      }
      existingByName.set(normalizedName, lottery);
    }
    
    // Draw times: 3 draws today, 3 draws tomorrow
    // 2:30 PM, 3:00 PM, 3:30 PM (on different day)
    const drawTimes = [
      { hours: 14, minutes: 30 },  // 2:30 PM
      { hours: 15, minutes: 0 },   // 3:00 PM
      { hours: 15, minutes: 30 },  // 3:30 PM
    ];

    for (let i = 0; i < REQUIRED_LOTTERIES.length; i++) {
      const lotteryName = REQUIRED_LOTTERIES[i];
      
      if (existingByName.has(lotteryName.toLowerCase())) {
        continue; // Already exists
      }

      // Stagger lotteries across multiple days and times
      const dayOffset = Math.floor(i / drawTimes.length);
      const timeIndex = i % drawTimes.length;
      const drawTime = drawTimes[timeIndex];

      const drawDate = new Date();
      drawDate.setDate(drawDate.getDate() + dayOffset);
      drawDate.setHours(drawTime.hours, drawTime.minutes, 0, 0);

      await Lottery.create({
        lotteryName,
        ticketPrice: 10.50,
        firstPrize: 100,
        secondPrize: 50,
        thirdPrize: 20,
        totalTickets: 1000,
        drawDate,
      }, { transaction });

      existingByName.set(lotteryName.toLowerCase(), true);

      console.log(`✓ Created lottery: ${lotteryName} (Draw: ${drawDate.toLocaleString()})`);
    }

    await transaction.commit();
    console.log("✅ All required lotteries ensured");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function main() {
  await sequelize.authenticate();
  
  // Ensure all required lotteries exist
  await ensureAllLotteries();
  
  const lotteries = await validateLotteries();

  console.log(`📋 Lottery database has ${lotteries.length} draws:`);
  console.table(lotteries.map((lottery) => ({
    id: lottery.id,
    lotteryName: lottery.lotteryName,
    drawDate: lottery.drawDate.toLocaleString(),
  })));
}

main()
  .catch((error) => {
    console.error("Lottery seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
