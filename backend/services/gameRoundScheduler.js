const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { GameDefinition, GameRound } = require("./demoGameModels");

const DEFAULT_DURATION_SECONDS = 60;
const SCHEDULER_INTERVAL_MS = 1000;
const ADVISORY_LOCK_KEY = 847291;

function positiveSeconds(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function durationFor(game) {
  return positiveSeconds(game.configuration?.roundDurationSeconds, positiveSeconds(process.env.GAME_ROUND_DURATION_SECONDS, DEFAULT_DURATION_SECONDS));
}

function gapFor(game) {
  return positiveSeconds(game.configuration?.roundGapSeconds, 0);
}

function roundCodeFor(game, startTime) {
  return `${game.slug}-${startTime.getTime()}`.slice(0, 80);
}

async function createRound(game, startTime, transaction) {
  const durationSeconds = durationFor(game);
  const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
  return GameRound.create({
    GameDefinitionId: game.id,
    roundCode: roundCodeFor(game, startTime),
    startTime,
    endTime,
    status: "OPEN",
    resultStatus: "PENDING",
  }, { transaction });
}

async function scheduleGame(game, now, transaction) {
  await GameRound.update(
    { status: "CLOSED" },
    { where: { GameDefinitionId: game.id, status: "OPEN", endTime: { [Op.lte]: now } }, transaction }
  );

  let active = await GameRound.findOne({
    where: { GameDefinitionId: game.id, status: "OPEN", startTime: { [Op.lte]: now }, endTime: { [Op.gt]: now } },
    order: [["startTime", "ASC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  let upcoming = await GameRound.findOne({
    where: { GameDefinitionId: game.id, status: "OPEN", startTime: { [Op.gt]: now } },
    order: [["startTime", "ASC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!active && upcoming) {
    const startTime = now;
    const endTime = new Date(startTime.getTime() + durationFor(game) * 1000);
    await upcoming.update({ startTime, endTime }, { transaction });
    active = upcoming;
    upcoming = null;
  }

  if (!active) {
    active = await createRound(game, now, transaction);
  }

  if (!upcoming) {
    const nextStart = new Date(active.endTime.getTime() + gapFor(game) * 1000);
    await createRound(game, nextStart, transaction);
  }
}

async function runSchedulerTick() {
  const transaction = await sequelize.transaction();
  try {
    const [lockRow] = await sequelize.query("SELECT pg_try_advisory_xact_lock(:lockKey) AS locked", { replacements: { lockKey: ADVISORY_LOCK_KEY }, transaction });
    if (!lockRow[0]?.locked) {
      await transaction.rollback();
      return;
    }
    const games = await GameDefinition.findAll({ where: { enabled: true }, transaction, lock: transaction.LOCK.UPDATE });
    const now = new Date();
    for (const game of games) await scheduleGame(game, now, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

function startGameRoundScheduler() {
  let running = false;
  let stopped = false;
  const tick = async () => {
    if (stopped || running) return;
    running = true;
    try { await runSchedulerTick(); }
    catch (error) { console.error("Game round scheduler error:", error.message); }
    finally { running = false; }
  };
  tick();
  const interval = setInterval(tick, SCHEDULER_INTERVAL_MS);
  return () => { stopped = true; clearInterval(interval); };
}

module.exports = { startGameRoundScheduler, runSchedulerTick, DEFAULT_DURATION_SECONDS };
