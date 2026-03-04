const authService = require("../services/auth.service");
const { ok } = require("../utils/response");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.loginWithEmailPassword(email, password);
    return ok(res, data, "Login success");
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    return ok(res, data, "Token refreshed");
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

module.exports = { login, refresh, me };