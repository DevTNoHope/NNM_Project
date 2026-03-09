const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const usersModel = require("../models/users.model");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

async function loginWithGoogle(googleToken) {
  if (!googleToken) throw new ApiError(400, "googleToken is required");

  // TODO: Verify Google Token using google-auth-library
  // const client = new OAuth2Client(CLIENT_ID);
  // const ticket = await client.verifyIdToken({ idToken: googleToken });
  // const { email, sub: google_sub } = ticket.getPayload();

  // Mock data cho cơ bản
  const email = "mocked.email@gmail.com";
  // const googleSub = "mock-google-sub";

  let user = await usersModel.findByEmail(email);
  if (!user) {
    // Nếu chưa có user thì cần tạo, phần này cần bổ sung hàm create vào usersModel
    throw new ApiError(404, "User not found. Need registration logic.");
  }

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

module.exports = { loginWithGoogle, refresh, getMe };