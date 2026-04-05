const statsService = require("../services/stats.service");
const { ok } = require("../utils/response");

async function getPlatformStats(req, res, next) {
  try {
    const data = await statsService.getPlatformStats();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlatformStats };
