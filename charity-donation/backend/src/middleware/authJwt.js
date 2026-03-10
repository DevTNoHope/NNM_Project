const ApiError = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/jwt");

function authJwt(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return next(new ApiError(401, "Missing access token"));

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}

module.exports = authJwt;
