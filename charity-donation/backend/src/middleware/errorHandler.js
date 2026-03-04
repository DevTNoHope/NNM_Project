const { fail } = require("../utils/response");
const ApiError = require("../utils/apiError");

function errorHandler(err, _req, res, _next) {
  // Nếu là lỗi chủ động (ApiError)
  if (err instanceof ApiError) {
    return fail(res, err.statusCode, err.message, err.details);
  }

  // Lỗi từ MySQL hoặc lỗi khác
  console.error("Unhandled error:", err);
  return fail(res, 500, "Internal Server Error");
}

module.exports = errorHandler;