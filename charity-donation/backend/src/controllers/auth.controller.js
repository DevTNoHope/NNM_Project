const authService = require("../services/auth.service");
const response = require("../utils/response");

const loginWithWallet = async (req, res, next) => {
  try {
    const { address, message, signature } = req.body;

    const result = await authService.loginWithWallet({
      address,
      message,
      signature,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.ok(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const accessToken = await authService.refreshAccessToken(token);

    return response.ok(res, {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginWithWallet,
  refreshToken,
};
