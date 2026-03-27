const usersService = require("../services/users.service");
const badgesService = require("../services/badges.service");
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

const getMyBadges = async (req, res, next) => {
  try {
    const data = await badgesService.getMyBadges(req.user.id);
    return response.ok(res, data, "Get my badges successfully");
  } catch (err) {
    return next(err);
  }
};

const getMyBadgeProgress = async (req, res, next) => {
  try {
    const data = await badgesService.getMyBadgeProgress(req.user.id);
    return response.ok(res, data, "Get my badge progress successfully");
  } catch (err) {
    return next(err);
  }
};

const setMySelectedBadge = async (req, res, next) => {
  try {
    const data = await badgesService.setSelectedBadge(req.user.id, req.body.badgeId);
    return response.ok(res, data, "Display badge updated successfully");
  } catch (err) {
    return next(err);
  }
};

const getPublicBadges = async (req, res, next) => {
  try {
    const data = await badgesService.getMyBadges(req.params.userId);
    return response.ok(res, data, "Get user badges successfully");
  } catch (err) {
    return next(err);
  }
};

const getPublicBadgeProgress = async (req, res, next) => {
  try {
    const data = await badgesService.getMyBadgeProgress(req.params.userId);
    return response.ok(res, data, "Get user badge progress successfully");
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
  getMyBadges,
  getMyBadgeProgress,
  setMySelectedBadge,
  getPublicBadges,
  getPublicBadgeProgress,
};
