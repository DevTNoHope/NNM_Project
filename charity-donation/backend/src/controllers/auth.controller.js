const authService = require("../services/auth.service");
const response = require("../utils/response");
const ApiError = require("../utils/apiError");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const loginWithWallet = async (req, res, next) => {
  try {
    const { address, message, signature } = req.body;

    const result = await authService.loginWithWallet({
      address,
      message,
      signature,
    });

    res.cookie("refreshToken", result.refreshToken, getCookieOptions());

    return response.ok(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login success",
    );
  } catch (error) {
    next(error);
  }
};

async function login(req, res, next) {
  try {
    const { email, googleSub, name } = req.body;

    const { user, accessToken, refreshToken } =
      await authService.loginWithGoogle({
        email,
        googleSub,
        name,
      });

    res.cookie("refreshToken", refreshToken, getCookieOptions());
    return response.ok(res, { user, accessToken }, "Login success");
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

    const data = await authService.refresh(refreshToken);

    res.cookie("refreshToken", data.refreshToken, getCookieOptions());

    return response.ok(
      res,
      {
        user: data.user,
        accessToken: data.accessToken,
      },
      "Token refreshed",
    );
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie("refreshToken");
    return response.ok(res, null, "Logout success");
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return response.ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  loginWithWallet,
  login,
  refresh,
  logout,
  me,
};
