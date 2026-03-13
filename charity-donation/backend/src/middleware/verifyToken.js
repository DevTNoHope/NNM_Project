const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const env = require("../config/env");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      env.jwt?.accessSecret || process.env.JWT_ACCESS_SECRET,
    );

    req.user = {
      id: decoded.id || decoded.sub,
      role: decoded.role,
      email: decoded.email || null,
      wallet: decoded.wallet || null,
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

module.exports = {
  verifyToken,
};
