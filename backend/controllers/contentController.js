const { Op } = require("sequelize");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function parseInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseConfiguration(value) {
  if (value === undefined || value === null || value === "") return {};
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { throw new Error("configuration must be valid JSON"); }
}

function slugify(value) {
  return String(value || "game").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function publicWhere(Model) {
  const where = { status: "ACTIVE" };
  if (Model.name === "Promotion" || Model.name === "Offer") {
    const now = new Date();
    where.startDate = { [Op.lte]: now };
    where.endDate = { [Op.gte]: now };
  }
  return where;
}

function createContentController({ Model, name, fields, requiredFields, imageFolder }) {
  const list = async (req, res) => {
    try {
      const items = await Model.findAll({ order: [["displayOrder", "ASC"], ["id", "ASC"]] });
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const get = async (req, res) => {
    try {
      const rawId = String(req.params.id || "");
      const item = await Model.findOne({ where: /^\d+$/.test(rawId) ? { id: Number(rawId) } : { slug: rawId, status: "ACTIVE" } });
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const save = async (req, res) => {
    let uploaded = null;
    try {
      const body = req.body || {};
      const payload = {};
      for (const field of fields) {
        if (body[field] !== undefined) payload[field] = body[field];
      }
      if (name === "Game") {
        payload.slug = body.slug ? slugify(body.slug) : slugify(body.name);
        payload.configuration = parseConfiguration(body.configuration);
      }
      if (body.status !== undefined) payload.status = String(body.status).toUpperCase();
      if (body.featured !== undefined) payload.featured = parseBoolean(body.featured);
      if (body.displayOrder !== undefined) payload.displayOrder = parseInteger(body.displayOrder);
      if (body.startDate !== undefined) payload.startDate = parseDate(body.startDate);
      if (body.endDate !== undefined) payload.endDate = parseDate(body.endDate);

      const item = req.params.id ? await Model.findByPk(Number(req.params.id)) : null;
      if (req.params.id && !item) return res.status(404).json({ success: false, message: `${name} not found` });
      if (item) {
        for (const field of requiredFields) {
          if (payload[field] === undefined) payload[field] = item[field];
        }
      }

      const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
      if (missing.length) return res.status(400).json({ success: false, message: `Required fields: ${missing.join(", ")}` });
      if (payload.status && !STATUS_VALUES.includes(payload.status)) return res.status(400).json({ success: false, message: "status must be ACTIVE or INACTIVE" });
      if ((requiredFields.includes("startDate") || requiredFields.includes("endDate")) && (!payload.startDate || !payload.endDate)) return res.status(400).json({ success: false, message: "Valid startDate and endDate are required" });
      if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) return res.status(400).json({ success: false, message: "endDate must be after startDate" });

      if (req.file) {
        uploaded = await uploadBuffer(req.file.buffer, `thumbi-lotteries/${imageFolder}`);
        payload.image = uploaded.secure_url;
        payload.imagePublicId = uploaded.public_id;
      }

      if (item) {
        const previousPublicId = item.imagePublicId;
        await item.update(payload);
        if (uploaded && previousPublicId) await deleteAsset(previousPublicId).catch(() => {});
      } else {
        payload.status = payload.status || "ACTIVE";
        payload.featured = payload.featured ?? false;
        payload.displayOrder = payload.displayOrder ?? 0;
        const created = await Model.create(payload);
        return res.status(201).json({ success: true, data: created });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      if (uploaded?.public_id) await deleteAsset(uploaded.public_id).catch(() => {});
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const updateStatus = async (req, res) => {
    try {
      const item = await Model.findByPk(Number(req.params.id));
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      const status = String(req.body?.status || "").toUpperCase();
      if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "status must be ACTIVE or INACTIVE" });
      await item.update({ status });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const remove = async (req, res) => {
    try {
      const item = await Model.findByPk(Number(req.params.id));
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      await item.destroy();
      await deleteAsset(item.imagePublicId).catch(() => {});
      res.json({ success: true, data: { id: item.id } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const publicList = async (req, res) => {
    try {
      const items = await Model.findAll({ where: publicWhere(Model), order: [["displayOrder", "ASC"], ["id", "ASC"]] });
      const data = items.map((item) => {
        const value = item.toJSON();
        if (name === "Game") delete value.imagePublicId;
        return value;
      });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  const publicGet = async (req, res) => {
    try {
      const rawId = String(req.params.id || "");
      const where = /^\d+$/.test(rawId) ? { id: Number(rawId), status: "ACTIVE" } : { slug: rawId, status: "ACTIVE" };
      const item = await Model.findOne({ where });
      if (!item) return res.status(404).json({ success: false, message: `${name} not found` });
      const value = item.toJSON();
      if (name === "Game") delete value.imagePublicId;
      res.json({ success: true, data: value });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  };

  return { list, get, save, updateStatus, remove, publicList, publicGet };
}

const gameController = createContentController({ Model: require("../models/Game"), name: "Game", fields: ["name", "slug", "description", "category", "gameType", "configuration", "status", "featured", "displayOrder"], requiredFields: ["name", "category", "gameType"], imageFolder: "games" });
const promotionController = createContentController({ Model: require("../models/Promotion"), name: "Promotion", fields: ["title", "description", "type", "status", "featured", "startDate", "endDate", "displayOrder"], requiredFields: ["title", "type", "startDate", "endDate"], imageFolder: "promotions" });
const offerController = createContentController({ Model: require("../models/Offer"), name: "Offer", fields: ["title", "type", "description", "image", "rewardText", "status", "featured", "startDate", "endDate", "displayOrder"], requiredFields: ["title", "type", "startDate", "endDate"], imageFolder: "offers" });

module.exports = { gameController, promotionController, offerController };
