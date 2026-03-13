const usersService = require("../services/users.service");
const response = require("../utils/response");
const ApiError = require("../utils/apiError");

const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const data = await usersService.getMe(req.user.id);
    return response.ok(res, data, "Get my profile successfully");
  } catch (err) {
    return next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const data = await usersService.updateMe(req.user.id, req.body);
    return response.ok(res, data, "Update profile successfully");
  } catch (err) {
    return next(err);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const data = await usersService.getPublicProfile(req.params.userId);
    return response.ok(res, data, "Get public profile successfully");
  } catch (err) {
    return next(err);
  }
};

const getUserProjects = async (req, res, next) => {
  try {
    const data = await usersService.getUserProjects(req.params.userId);
    return response.ok(res, data, "Get user projects successfully");
  } catch (err) {
    return next(err);
  }
};

const getUserDonations = async (req, res, next) => {
  try {
    const data = await usersService.getUserDonations(req.params.userId);
    return response.ok(res, data, "Get user donations successfully");
  } catch (err) {
    return next(err);
  }
};

const sendVerificationOtp = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const data = await usersService.sendVerificationOtp(req.user.id);
    return response.ok(res, data, "Send verification OTP successfully");
  } catch (err) {
    return next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const { otp } = req.body;
    const data = await usersService.verifyOtp(req.user.id, otp);
    return response.ok(res, data, "Verify OTP successfully");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  getPublicProfile,
  getUserProjects,
  getUserDonations,
  sendVerificationOtp,
  verifyOtp,
};
