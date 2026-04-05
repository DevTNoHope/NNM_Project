const badgesService = require("../services/badges.service");
const { ok, created } = require("../utils/response");

// GET
async function getAllBadges(req, res, next) {
  try {
    const badges = await badgesService.getAllBadges();
    return ok(res, badges, "All badges fetched successfully");
  } catch (err) {
    next(err);
  }
}

// POST
async function createBadge(req, res, next) {
  try {
    const badge = await badgesService.createBadge(req.body);
    return created(res, badge, "Badge created successfully");
  } catch (err) {
    next(err);
  }
}

// PUT
async function updateBadge(req, res, next) {
  try {
    const badge = await badgesService.updateBadge(req.params.id, req.body);
    return ok(res, badge, "Badge updated successfully");
  } catch (err) {
    next(err);
  }
}

// DELETE
async function deleteBadge(req, res, next) {
  try {
    const result = await badgesService.deleteBadge(req.params.id);
    return ok(res, result, "Badge deleted successfully");
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