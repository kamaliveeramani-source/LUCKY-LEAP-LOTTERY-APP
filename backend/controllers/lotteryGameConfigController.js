const { Op } = require("sequelize");
const LotteryGameConfig = require("../models/LotteryGameConfig");

function numberOrNull(value, field, required = false) {
  if (value === "" || value === null || value === undefined) {
    return required ? `${field} is required` : null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return `${field} must be greater than 0`;
  return number;
}

function gamePayload(body = {}, partial = false) {
  const name = body.name === undefined && partial ? undefined : String(body.name || "").trim();
  if (!partial && !name) return { error: "Game name is required" };
  if (partial && body.name !== undefined && !name) return { error: "Game name cannot be empty" };

  const fields = {};
  if (name !== undefined) fields.name = name;
  for (const [input, field, required] of [
    ["ticketPrice", "Ticket price", true],
    ["mainWinning", "Main winning", true],
    ["bcWinning", "BC winning", false],
    ["cWinning", "C winning", false],
  ]) {
    if (!partial || body[input] !== undefined) {
      const value = numberOrNull(body[input], field, required);
      if (typeof value === "string") return { error: value };
      fields[input] = value;
    }
  }
  if (body.isActive !== undefined) fields.isActive = Boolean(body.isActive);
  return { fields };
}

exports.listPublic = async (req, res) => {
  try {
    const data = await LotteryGameConfig.findAll({ where: { isActive: true }, order: [["id", "ASC"]] });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listAdmin = async (req, res) => {
  try {
    const data = await LotteryGameConfig.findAll({ order: [["id", "ASC"]] });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fields, error } = gamePayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const duplicate = await LotteryGameConfig.findOne({ where: { name: { [Op.iLike]: fields.name } } });
    if (duplicate) return res.status(409).json({ success: false, message: "Lottery game already exists" });
    const data = await LotteryGameConfig.create(fields);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await LotteryGameConfig.findByPk(Number(req.params.id));
    if (!record) return res.status(404).json({ success: false, message: "Lottery game not found" });
    const { fields, error } = gamePayload(req.body, true);
    if (error) return res.status(400).json({ success: false, message: error });
    if (fields.name && fields.name.toLowerCase() !== record.name.toLowerCase()) {
      const duplicate = await LotteryGameConfig.findOne({ where: { name: { [Op.iLike]: fields.name }, id: { [Op.ne]: record.id } } });
      if (duplicate) return res.status(409).json({ success: false, message: "Lottery game already exists" });
    }
    await record.update(fields);
    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const record = await LotteryGameConfig.findByPk(Number(req.params.id));
    if (!record) return res.status(404).json({ success: false, message: "Lottery game not found" });
    if (typeof req.body?.isActive !== "boolean") return res.status(400).json({ success: false, message: "isActive must be true or false" });
    await record.update({ isActive: req.body.isActive });
    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};