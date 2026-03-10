const { getAddress, verifyMessage } = require("viem");
const usersModel = require("../models/users.model");
const ApiError = require("../utils/apiError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const loginWithWallet = async ({ address, message, signature }) => {
  let wallet;

  try {
    wallet = getAddress(address);
  } catch {
    throw new ApiError(400, "Invalid wallet address");
  }

  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Missing or invalid message");
  }

  if (!signature || typeof signature !== "string") {
    throw new ApiError(400, "Missing or invalid signature");
  }

  let isValid = false;

  try {
    isValid = await verifyMessage({
      address: wallet,
      message,
      signature,
    });
  } catch {
    throw new ApiError(400, "Invalid signature format");
  }

  if (!isValid) {
    throw new ApiError(401, "Invalid wallet signature");
  }

  let user = await usersModel.findByWallet(wallet);

  if (!user) {
    await usersModel.createWalletUser(wallet);
    user = await usersModel.findByWallet(wallet);
  }

  const payload = {
    sub: user.id,
    role: user.role,
    wallet: user.linked_wallet,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Missing refresh token");
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  return signAccessToken({
    sub: payload.sub,
    role: payload.role,
    wallet: payload.wallet,
  });
};

module.exports = {
  loginWithWallet,
  refreshAccessToken,
};
