const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const usersModel = require("../models/users.model");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

async function loginWithEmailPassword(email, password) {
  if (!email || !password) throw new ApiError(400, "email & password are required");

  const user = await usersModel.findByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  // Nếu bạn không dùng password trong DB (vì google-only), đoạn này sẽ đổi sau
  if (!user.password_hash) throw new ApiError(401, "Password login is disabled (google-only)");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const payload = { id: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(400, "refreshToken is required");
  const payload = verifyRefreshToken(refreshToken);

  const user = await usersModel.findById(payload.id);
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const newPayload = { id: user.id, role: user.role, email: user.email };

  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload)
  };
}

async function getMe(userId) {
  const user = await usersModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  // trả về tối thiểu
  return { id: user.id, email: user.email, role: user.role, linkedWallet: user.linked_wallet };
}

module.exports = { loginWithEmailPassword, refresh, getMe };