const { getAddress, verifyMessage } = require("viem");
const { OAuth2Client } = require("google-auth-library");

const usersModel = require("../models/users.model");
const ApiError = require("../utils/apiError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const env = require("../config/env");

const googleClient = new OAuth2Client(
  env.google?.clientId || process.env.GOOGLE_CLIENT_ID,
);

const buildTokenPayload = (user) => ({
  id: user.id,
  sub: user.id,
  role: user.role,
  email: user.email || null,
  wallet: user.linked_wallet || null,
});

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  linked_wallet: user.linked_wallet || null,
  google_sub: user.google_sub || null,
  is_verified: Boolean(user.is_verified),
});

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
    user = await usersModel.createWalletUser(wallet);
  } else {
    user = await usersModel.findById(user.id);
  }

  const tokenPayload = buildTokenPayload(user);

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

async function loginWithGoogle({ email, googleSub, name }) {
  if (!email) throw new ApiError(400, "Email is required");
  if (!googleSub) throw new ApiError(400, "googleSub is required");

  const normalizedEmail = String(email).toLowerCase().trim();

  let user = await usersModel.findByGoogleSub(googleSub);

  if (!user) {
    user = await usersModel.findByEmail(normalizedEmail);
  }

  if (!user) {
    user = await usersModel.createGoogleUser({
      email: normalizedEmail,
      googleSub,
      name,
      role: "USER",
    });
  } else if (!user.google_sub) {
    user = await usersModel.attachGoogleSub(user.id, googleSub);
  }

  user = await usersModel.findById(user.id);

  const tokenPayload = buildTokenPayload(user);

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const userId = payload.id || payload.sub;
  const user = await usersModel.findById(userId);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokenPayload = buildTokenPayload(user);

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}

async function getMe(userId) {
  const user = await usersModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    linkedWallet: user.linked_wallet,
    google_sub: user.google_sub,
  };
}

module.exports = {
  loginWithWallet,
  loginWithGoogle,
  refresh,
  getMe,
};
