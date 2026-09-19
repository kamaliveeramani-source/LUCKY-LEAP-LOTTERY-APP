const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");
const { GameDefinition, GameRound, GameOption, GameSelection, GameResult, GameActivity, DemoWallet } = require("../services/demoGameModels");

const GAME_TYPES = GameDefinition.GAME_TYPES;
const ROUND_STATUSES = ["OPEN", "CLOSED", "CANCELLED"];
const DEMO_MULTIPLIERS = [1, 3, 9, 27, 81, 243, 729];

function id(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${field} must be a positive integer`);
  return parsed;
}

function dateValue(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error(`${field} must be a valid date`);
  return date;
}

function responseError(res, error) {
  const status = /not found/i.test(error.message) ? 404 : /required|must be|invalid|closed|duplicate|insufficient|available/i.test(error.message) ? 400 : 500;
  return res.status(status).json({ success: false, message: error.message });
}

async function recordActivity(values, transaction) {
  return GameActivity.create({
    action: values.action,
    title: values.title,
    message: values.message || "",
    result: values.result || "SUCCESS",
    actorUserId: values.actorUserId || null,
    UserId: values.UserId || null,
    GameDefinitionId: values.GameDefinitionId || null,
    GameRoundId: values.GameRoundId || null,
    metadata: values.metadata || {},
  }, { transaction });
}

function publicGame(game) {
  const item = game.toJSON ? game.toJSON() : game;
  return {
    ...item,
    gameType: item.gameType || item.type,
    status: item.status || (item.enabled ? "ACTIVE" : "INACTIVE"),
    category: item.category || "Games",
    displayOrder: item.displayOrder ?? 0,
    featured: Boolean(item.featured),
    image: item.image || null,
    imageUrl: item.image || null,
    options: item.options || undefined,
  };
}

async function listGames(req, res) {
  try {
    const definitions = await GameDefinition.findAll({ where: { enabled: true }, include: [{ model: GameOption, as: "options", where: { enabled: true }, required: false }, { model: GameRound, as: "rounds", where: { status: "OPEN" }, required: false, limit: 1, separate: true, order: [["endTime", "ASC"]] }], order: [["displayOrder", "ASC"], ["id", "ASC"]] });
    return res.json({ success: true, data: definitions.map(publicGame) });
  } catch (error) { return responseError(res, error); }
}

async function getGame(req, res) {
  try {
    const rawId = String(req.params.id || "");
    const where = /^\d+$/.test(rawId) ? { id: Number(rawId), enabled: true } : { slug: rawId, enabled: true };
    const game = await GameDefinition.findOne({ where, include: [{ model: GameOption, as: "options", where: { enabled: true }, required: false }] });
    if (!game) return res.status(404).json({ success: false, message: "Game not found" });
    return res.json({ success: true, data: publicGame(game) });
  } catch (error) { return responseError(res, error); }
}

async function getRounds(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const game = await GameDefinition.findOne({ where: { id: gameId, enabled: true } });
    if (!game) return res.status(404).json({ success: false, message: "Game not found" });
    const rounds = await GameRound.findAll({ where: { GameDefinitionId: gameId }, include: [{ model: GameResult, as: "result", required: false, where: { published: true }, include: [{ model: GameOption, as: "winningOption", required: false }] }], order: [["startTime", "DESC"]], limit: 50 });
    return res.json({ success: true, data: rounds });
  } catch (error) { return responseError(res, error); }
}

async function getResults(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const results = await GameResult.findAll({ where: { published: true }, include: [{ model: GameRound, as: "round", required: true, where: { GameDefinitionId: gameId }, include: [{ model: GameDefinition, as: "game", attributes: ["id", "name", "slug", "type"] }] }, { model: GameOption, as: "winningOption", required: false }], order: [["publishedAt", "DESC"]], limit: 50 });
    return res.json({ success: true, data: results });
  } catch (error) { return responseError(res, error); }
}

async function getHistory(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const history = await GameRound.findAll({ where: { GameDefinitionId: gameId, resultStatus: "PUBLISHED" }, include: [{ model: GameResult, as: "result", required: true, include: [{ model: GameOption, as: "winningOption", required: false }] }], order: [["endTime", "DESC"]], limit: 100 });
    return res.json({ success: true, data: history });
  } catch (error) { return responseError(res, error); }
}

async function getDemoWallet(req, res) {
  try {
    const wallet = await DemoWallet.getOrCreateForUser(req.user.userId);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEMO WALLET] balance read", { userId: req.user.userId, balance: Number(wallet.balance) });
    }
    return res.json({ success: true, data: { balance: Number(wallet.balance), currency: wallet.currency, status: wallet.status } });
  } catch (error) { return responseError(res, error); }
}

async function createSelection(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const gameId = id(req.params.id, "game id");
    const roundId = id(req.body.roundId, "round id");
    const stakeAmount = Number(req.body.stakeAmount);
    const multiplier = Number(req.body.multiplier || 1);
    if (!Number.isFinite(stakeAmount) || stakeAmount <= 0) throw new Error("stakeAmount must be greater than zero");
    if (!DEMO_MULTIPLIERS.includes(multiplier)) throw new Error("multiplier is invalid");
    const amount = Number((stakeAmount * multiplier).toFixed(2));
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEMO SELECTION] request", { userId: req.user.userId, gameId, stakeAmount, multiplier, required: amount });
    }
    const game = await GameDefinition.findOne({ where: { id: gameId, enabled: true }, transaction });
    if (!game) throw new Error("Game not found");
    const round = await GameRound.findOne({ where: { id: roundId, GameDefinitionId: gameId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!round) throw new Error("Round not found");
    const now = new Date();
    if (round.status !== "OPEN" || now < round.startTime || now >= round.endTime) throw new Error("Round is closed for selections");
    const existing = await GameSelection.findOne({ where: { UserId: req.user.userId, GameRoundId: roundId }, transaction, lock: transaction.LOCK.UPDATE });
    if (existing) throw new Error("A selection already exists for this round");
    const optionId = req.body.GameOptionId ? id(req.body.GameOptionId, "option id") : null;
    let option = null;
    if (optionId) {
      option = await GameOption.findOne({ where: { id: optionId, GameDefinitionId: gameId, enabled: true }, transaction });
      if (!option) throw new Error("Selected option is invalid");
    } else if (!req.body.selectedValue) {
      throw new Error("A selected option or selectedValue is required");
    }
    if (game.type === "GREEN_YELLOW_RED" && !option) {
      const configuredNumbers = Array.isArray(game.configuration?.numbers) ? game.configuration.numbers : [];
      const configured = configuredNumbers.find((item) => String(item?.number ?? item?.value ?? item) === String(req.body.selectedValue));
      if (!configured) throw new Error("Selected option is invalid");
      if (req.body.selectedColor && configured.color && String(req.body.selectedColor).toUpperCase() !== String(configured.color).toUpperCase()) throw new Error("Selected colour is invalid");
    } else if (game.type === "GREEN_YELLOW_RED" && option) {
      const optionValues = [option.value, option.key, option.label].filter(Boolean).map(String);
      if (!optionValues.includes(String(req.body.selectedValue))) throw new Error("Selected option is invalid");
      if (req.body.selectedColor && option.colour && String(req.body.selectedColor).toUpperCase() !== String(option.colour).toUpperCase()) throw new Error("Selected colour is invalid");
    }
    await DemoWallet.getOrCreateForUser(req.user.userId, { transaction });
    const updatedWallet = await DemoWallet.debit(req.user.userId, amount, { transaction });
    const selection = await GameSelection.create({ UserId: req.user.userId, GameDefinitionId: gameId, GameRoundId: roundId, GameOptionId: optionId, selectedValue: req.body.selectedValue || option?.value || option?.key || null, stakeAmount, multiplier, demoAmount: amount, status: "PENDING" }, { transaction });
    await recordActivity({ action: "GAME_SELECTION_CREATED", title: "Demo game selection created", message: `User ${req.user.userId} selected an option for round ${round.roundCode}.`, UserId: req.user.userId, GameDefinitionId: gameId, GameRoundId: roundId, metadata: { demoAmount: amount } }, transaction);
    await transaction.commit();
    const updatedDemoBalance = Number(updatedWallet.balance);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEMO SELECTION] completed", { userId: req.user.userId, required: amount, demoBalance: updatedDemoBalance });
    }
    return res.status(201).json({ success: true, data: { selection, demoBalance: updatedDemoBalance } });
  } catch (error) {
    await transaction.rollback();
    if (process.env.NODE_ENV !== "production") {
      console.debug("[DEMO SELECTION] rejected", { userId: req.user?.userId || null, reason: error.message });
    }
    return responseError(res, error);
  }
}

async function listUserSelections(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const selections = await GameSelection.findAll({
      where: { UserId: req.user.userId, GameDefinitionId: gameId },
      include: [{ model: GameRound, as: "round", attributes: ["id", "roundCode", "status"] }, { model: GameOption, as: "option", attributes: ["id", "key", "label", "value", "colour"] }],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    return res.json({ success: true, data: selections.map((selection) => ({ id: selection.id, round: selection.round?.roundCode || "-", selectedValue: selection.selectedValue, option: selection.option?.label || selection.option?.value || selection.selectedValue || "-", colour: selection.option?.colour || null, stakeAmount: Number(selection.stakeAmount), multiplier: Number(selection.multiplier), demoAmount: Number(selection.demoAmount), status: selection.status })) });
  } catch (error) { return responseError(res, error); }
}

async function listAdminGames(req, res, next) {
  try {
    const definitions = await GameDefinition.findAll({ include: [{ model: GameOption, as: "options" }], order: [["displayOrder", "ASC"], ["id", "ASC"]] });
    definitions.sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0) || left.id - right.id);
    return res.json({ success: true, data: definitions.map(publicGame) });
  } catch (error) { return next(error); }
}

async function createAdminGame(req, res, next) {
  const transaction = await sequelize.transaction();
  let uploaded = null;
  try {
    const { name, slug, type, description = "", enabled = false, configuration = {} } = req.body || {};
    if (!name || !slug || !GAME_TYPES.includes(type)) throw new Error("name, slug, and a supported type are required");
    if (req.file) uploaded = await uploadBuffer(req.file.buffer, "thumbi-lotteries/games");
    const game = await GameDefinition.create({ name, slug, type, description, enabled: enabled === true || enabled === "true", configuration, image: uploaded?.secure_url || null, category: req.body.category || "Games", displayOrder: Number(req.body.displayOrder || 0), featured: req.body.featured === true || req.body.featured === "true" }, { transaction });
    await recordActivity({ action: "GAME_CREATED", title: "Demo game created", message: `Game ${game.name} was created.`, actorUserId: req.user.userId, GameDefinitionId: game.id, metadata: { type: game.type } }, transaction);
    await transaction.commit();
    return res.status(201).json({ success: true, data: game });
  } catch (error) { await transaction.rollback(); if (uploaded?.public_id) await deleteAsset(uploaded.public_id).catch(() => {}); return responseError(res, error); }
}

async function findDefinitionOrNext(req, next) {
  const gameId = id(req.params.id, "game id");
  const game = await GameDefinition.findByPk(gameId);
  if (!game) { next(); return null; }
  return game;
}

async function updateAdminGame(req, res, next) {
  try {
    const game = await findDefinitionOrNext(req, next);
    if (!game) return;
    const updates = {};
      ["name", "slug", "description", "configuration"].forEach((field) => { if (req.body[field] !== undefined) updates[field] = field === "configuration" ? (typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field]) : req.body[field]; });
      const requestedType = req.body.type || req.body.gameType;
      if (requestedType !== undefined) { if (!GAME_TYPES.includes(requestedType)) throw new Error("Unsupported game type"); updates.type = requestedType; }
      if (req.body.enabled !== undefined) updates.enabled = req.body.enabled === true || req.body.enabled === "true";
      if (req.body.status !== undefined) updates.enabled = String(req.body.status).toUpperCase() === "ACTIVE";
      ["category", "displayOrder", "featured"].forEach((field) => { if (req.body[field] !== undefined && Object.prototype.hasOwnProperty.call(game.rawAttributes, field)) updates[field] = field === "displayOrder" ? Number(req.body[field]) : field === "featured" ? (req.body[field] === true || req.body[field] === "true") : req.body[field]; });
      if (req.file) {
        const uploaded = await uploadBuffer(req.file.buffer, "thumbi-lotteries/games");
        updates.image = uploaded.secure_url;
        if (game.image) await deleteAsset(game.image).catch(() => {});
      }
      await game.update(updates);
    await recordActivity({ action: "GAME_UPDATED", title: "Demo game updated", message: `Game ${game.name} was updated.`, actorUserId: req.user.userId, GameDefinitionId: game.id });
    return res.json({ success: true, data: game });
  } catch (error) { return responseError(res, error); }
}

async function createRound(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const game = await GameDefinition.findByPk(gameId);
    if (!game) throw new Error("Game not found");
    const startTime = req.body.startTime ? dateValue(req.body.startTime, "startTime") : new Date();
    const endTime = req.body.endTime ? dateValue(req.body.endTime, "endTime") : new Date(startTime.getTime() + Number(req.body.durationSeconds || 60) * 1000);
    if (endTime <= startTime) throw new Error("endTime must be after startTime");
    if (!req.body.roundCode) throw new Error("roundCode is required");
    const round = await GameRound.create({ GameDefinitionId: gameId, roundCode: req.body.roundCode, startTime, endTime, status: "OPEN", resultStatus: "PENDING" });
    await recordActivity({ action: "GAME_ROUND_CREATED", title: "Demo game round created", message: `Round ${round.roundCode} was created.`, actorUserId: req.user.userId, GameDefinitionId: gameId, GameRoundId: round.id });
    return res.status(201).json({ success: true, data: round });
  } catch (error) { return responseError(res, error); }
}

async function updateRound(req, res) {
  try {
    const round = await GameRound.findByPk(id(req.params.id, "round id"));
    if (!round) throw new Error("Round not found");
    const updates = {};
    if (req.body.status !== undefined) { if (!ROUND_STATUSES.includes(req.body.status)) throw new Error("Unsupported round status"); updates.status = req.body.status; }
    if (req.body.startTime !== undefined) updates.startTime = dateValue(req.body.startTime, "startTime");
    if (req.body.endTime !== undefined) updates.endTime = dateValue(req.body.endTime, "endTime");
    if (updates.startTime && (updates.endTime || round.endTime) <= updates.startTime) throw new Error("endTime must be after startTime");
    await round.update(updates);
    await recordActivity({ action: "GAME_ROUND_UPDATED", title: "Demo game round updated", message: `Round ${round.roundCode} was updated.`, actorUserId: req.user.userId, GameDefinitionId: round.GameDefinitionId, GameRoundId: round.id });
    return res.json({ success: true, data: round });
  } catch (error) { return responseError(res, error); }
}

async function publishResult(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const round = await GameRound.findByPk(id(req.params.id, "round id"), { transaction, lock: transaction.LOCK.UPDATE });
    if (!round) throw new Error("Round not found");
    if (round.resultStatus === "PUBLISHED") throw new Error("Round result is already published");
    const optionId = req.body.winningOptionId ? id(req.body.winningOptionId, "winning option id") : null;
    if (optionId) {
      const option = await GameOption.findOne({ where: { id: optionId, GameDefinitionId: round.GameDefinitionId, enabled: true }, transaction });
      if (!option) throw new Error("Winning option is invalid");
    }
    const publishedAt = new Date();
    const result = await GameResult.create({ GameRoundId: round.id, winningOptionId: optionId, winningValue: req.body.winningValue || null, published: true, publishedAt }, { transaction });
    const selections = await GameSelection.findAll({ where: { GameRoundId: round.id, status: "PENDING" }, transaction, lock: transaction.LOCK.UPDATE });
    const optionIds = selections.map((selection) => selection.GameOptionId).filter(Boolean);
    const options = optionIds.length ? await GameOption.findAll({ where: { id: optionIds }, transaction }) : [];
    const optionsById = new Map(options.map((option) => [option.id, option]));
    for (const selection of selections) {
      const won = optionId ? selection.GameOptionId === optionId : String(selection.selectedValue) === String(req.body.winningValue);
      if (won) {
        const multiplier = Number(optionsById.get(selection.GameOptionId)?.multiplier || 0);
        if (multiplier > 0) await DemoWallet.credit(selection.UserId, Number(selection.demoAmount) * multiplier, { transaction });
      }
      await selection.update({ status: won ? "WON" : "LOST" }, { transaction });
    }
    await round.update({ status: "CLOSED", resultStatus: "PUBLISHED", publishedAt }, { transaction });
    await recordActivity({ action: "GAME_RESULT_PUBLISHED", title: "Demo game result published", message: `Result published for round ${round.roundCode}.`, actorUserId: req.user.userId, GameDefinitionId: round.GameDefinitionId, GameRoundId: round.id, metadata: { selectionCount: selections.length } }, transaction);
    await transaction.commit();
    return res.json({ success: true, data: result });
  } catch (error) { await transaction.rollback(); return responseError(res, error); }
}

async function listSelections(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const selections = await GameSelection.findAll({ where: { GameDefinitionId: gameId }, include: [{ model: GameRound, as: "round", attributes: ["id", "roundCode", "status"] }, { model: GameOption, as: "option", attributes: ["id", "key", "label", "multiplier"] }, { model: require("../models/User"), as: "user", attributes: ["id", "fullName", "username"] }], order: [["createdAt", "DESC"]], limit: 200 });
    return res.json({ success: true, data: selections });
  } catch (error) { return responseError(res, error); }
}

async function listAdminHistory(req, res) {
  try {
    const gameId = id(req.params.id, "game id");
    const activities = await GameActivity.findAll({ where: { GameDefinitionId: gameId }, order: [["createdAt", "DESC"]], limit: 200 });
    return res.json({ success: true, data: activities });
  } catch (error) { return responseError(res, error); }
}

module.exports = { listGames, getGame, getRounds, getResults, getHistory, getDemoWallet, createSelection, listUserSelections, listAdminGames, createAdminGame, updateAdminGame, createRound, updateRound, publishResult, listSelections, listAdminHistory };
