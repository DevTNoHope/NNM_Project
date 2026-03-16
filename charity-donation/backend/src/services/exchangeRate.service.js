const axios = require("axios");
require("dotenv").config();

let cachedRate = null;
let cachedAt = 0;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút
const FALLBACK_USD_TO_VND = 26000;

async function getUsdToVndRate() {
  const now = Date.now();

  if (cachedRate && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }

  try {
    const res = await axios.get(process.env.EXCHANGE_RATE_API);
    const rate = Number(res?.data?.rates?.VND);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid USD/VND rate");
    }

    cachedRate = rate;
    cachedAt = now;
    return rate;
  } catch (error) {
    if (cachedRate) return cachedRate;
    return FALLBACK_USD_TO_VND;
  }
}

module.exports = {
  getUsdToVndRate,
};
