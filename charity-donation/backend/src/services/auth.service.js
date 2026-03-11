const { getAddress, verifyMessage } = require("viem");
const usersModel = require("../models/users.model");
const ApiError = require("../utils/apiError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const { OAuth2Client } = require("google-auth-library");
const env = require("../config/env");

const googleClient = new OAuth2Client(env.google?.clientId || process.env.GOOGLE_CLIENT_ID);

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

async function loginWithGoogle(googleToken) {
  if (!googleToken) {
    throw new ApiError(400, "googleToken is required");
  }

  const clientId = env.google?.clientId || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiError(500, "GOOGLE_CLIENT_ID is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new ApiError(401, "Invalid Google token");
  }

  const email = String(payload.email || "").toLowerCase().trim();
  const googleSub = payload.sub;
  const emailVerified = payload.email_verified;

  if (!email) {
    throw new ApiError(400, "Google account email not found");
  }

  if (!googleSub) {
    throw new ApiError(400, "Google account subject not found");
  }

  if (!emailVerified) {
    throw new ApiError(401, "Google email is not verified");
  }

  let user = await usersModel.findByGoogleSub(googleSub);

  if (!user) {
    user = await usersModel.findByEmail(email);
  }

  if (!user) {
    user = await usersModel.createGoogleUser({
      email,
      googleSub,
      role: "USER",
    });
  } else if (!user.google_sub) {
    user = await usersModel.attachGoogleSub(user.id, googleSub);
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      google_sub: user.google_sub,
    },
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload),
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(400, "refreshToken is required");

  const payload = verifyRefreshToken(refreshToken);
  const user = await usersModel.findById(payload.id);

  if (!user) throw new ApiError(401, "Invalid refresh token");

  const newPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  return {
    accessToken: signAccessToken(newPayload),
    refreshToken: signRefreshToken(newPayload),
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
  refreshAccessToken,
  loginWithGoogle,
  refresh,
  getMe,
};