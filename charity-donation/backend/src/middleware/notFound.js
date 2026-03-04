const ApiError = require("../utils/apiError");

function notFound(_req, _res, next) {
  next(new ApiError(404, "Not Found"));
}

module.exports = notFound;