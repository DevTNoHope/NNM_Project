const ApiError = require("../utils/apiError");

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role) return next(new ApiError(401, "Unauthenticated"));

    if (!allowedRoles.includes(role)) {
      return next(new ApiError(403, "Forbidden: insufficient role"));
    }

    next();
  };
}

module.exports = requireRole;