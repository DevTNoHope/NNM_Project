const BadgeModel = require("../models/badges.model");
const { ok } = require("../utils/response");

// GET
async function getAllBadges(req, res, next) {
  try {
    const data = await BadgeModel.getAll();
    return ok(res, data, "Fetched badges");
  } catch (err) {
    next(err);
  }
}

// POST
async function createBadge(req, res, next) {
  try {
    const badge = await BadgeModel.create(req.body);
    return ok(res, badge, "Created badge");
  } catch (err) {
    next(err);
  }
}

// PUT
async function updateBadge(req, res, next) {
  try {
    const badge = await BadgeModel.update(req.params.id, req.body);
    return ok(res, badge, "Updated badge");
  } catch (err) {
    next(err);
  }
}

// DELETE
async function deleteBadge(req, res, next) {
  try {
    await BadgeModel.delete(req.params.id);
    return ok(res, null, "Deleted badge");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge
};