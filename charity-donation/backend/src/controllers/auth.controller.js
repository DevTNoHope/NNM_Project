const authService = require("../services/auth.service");
const { ok } = require("../utils/response");
const ApiError = require("../utils/apiError");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

async function login(req, res, next) {
  try {
    const { googleToken } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginWithGoogle(googleToken);

    res.cookie("refreshToken", refreshToken, getCookieOptions());
    return ok(res, { user, accessToken }, "Login success");
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }

    // authService.refresh logic
    const data = await authService.refresh(refreshToken);
    res.cookie("refreshToken", data.refreshToken, getCookieOptions());

    return ok(res, { accessToken: data.accessToken }, "Token refreshed");
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie("refreshToken");
    return ok(res, null, "Logout success");
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  refresh,
  logout,
  me,
};