const rateLimit = require("express-rate-limit");

function createRateLimit({ windowMs = 15 * 60 * 1000, limit = 60, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: message || "Too many requests, please try again later.",
    },
  });
}

module.exports = { createRateLimit };
