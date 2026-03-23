const ApiError = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/jwt");

function authJwt(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Missing access token"));
    }

    const token = authHeader.slice(7);

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.id || payload.sub,
      role: payload.role,
      email: payload.email || null,
      wallet: payload.wallet || null,
    };

    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}

module.exports = authJwt;
