const statsModel = require("../models/stats.model");

async function getPlatformStats() {
  return statsModel.getPlatformStats();
}

module.exports = { getPlatformStats };
