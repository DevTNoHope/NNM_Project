const usersModel = require("../models/users.model");
const donationsModel = require("../models/donations.model");
const projectsModel = require("../models/projects.model");
const userBadgesModel = require("../models/user_badges.model");
const ApiError = require("../utils/apiError");
const { saveOtp, getOtp, deleteOtp } = require("../utils/otpStore");
const { sendMail } = require("../utils/mailer");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const usersService = {
  getMe: async (userId) => {
    const user = await usersModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const donations = await donationsModel.getDonationsByUserId(userId);
    const projects = await projectsModel.getProjectsByUserId(userId);
    const totalReceived = await donationsModel.getTotalReceivedByUserId(userId);

    const totalDonatedAmount = donations.reduce((sum, donation) => {
      return sum + Number(donation.amount || 0);
    }, 0);

    const selectedBadge = await userBadgesModel.getSelectedBadge(userId);

    return {
      ...user,
      selectedBadge,
      stats: {
        total_donations: donations.length,
        total_donated_amount: totalDonatedAmount,
        total_projects: projects.length,
        total_received: Number(totalReceived),
      },
    };
  },

  updateMe: async (userId, body) => {
    const user = await usersModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const payload = {
      name: body.name !== undefined ? body.name : user.name,
      email: body.email !== undefined ? body.email : user.email,
      linked_wallet:
        body.linked_wallet !== undefined
          ? body.linked_wallet
          : user.linked_wallet,
    };

    await usersModel.updateMyProfile(userId, payload);

    return await usersModel.findById(userId);
  },

  getPublicProfile: async (userId) => {
    const user = await usersModel.getPublicProfileById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const selectedBadge = await userBadgesModel.getSelectedBadge(userId);
    return { ...user, selectedBadge };
  },

  getUserProjects: async (userId) => {
    const user = await usersModel.getPublicProfileById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const projects = await projectsModel.getProjectsByUserId(userId);
    const totalReceived = await donationsModel.getTotalReceivedByUserId(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        linked_wallet: user.linked_wallet,
      },
      total_projects: projects.length,
      total_received: Number(totalReceived),
      projects,
    };
  },

  getUserDonations: async (userId) => {
    const user = await usersModel.getPublicProfileById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const donations = await donationsModel.getDonationsByUserId(userId);

    const totalAmount = donations.reduce((sum, donation) => {
      return sum + Number(donation.amount || 0);
    }, 0);

    return {
      user: {
        id: user.id,
        name: user.name,
        linked_wallet: user.linked_wallet,
      },
      total_donations: donations.length,
      total_amount: totalAmount,
      donations,
    };
  },

  sendVerificationOtp: async (userId) => {
    const user = await usersModel.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.email) {
      throw new ApiError(400, "This account does not have an email");
    }

    if (user.is_verified) {
      throw new ApiError(400, "Account already verified");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    saveOtp(userId, otp, expiresAt);

    await sendMail({
      to: user.email,
      subject: "Verify your account",
      text: `Your OTP code is ${otp}. This code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your account</h2>
          <p>Your OTP code is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return {
      message: "Verification OTP sent successfully",
    };
  },

  verifyOtp: async (userId, otpInput) => {
    const user = await usersModel.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.is_verified) {
      throw new ApiError(400, "Account already verified");
    }

    if (!otpInput) {
      throw new ApiError(400, "OTP is required");
    }

    const otpData = getOtp(userId);

    if (!otpData) {
      throw new ApiError(400, "OTP not found. Please request a new OTP");
    }

    if (new Date() > new Date(otpData.expiresAt)) {
      deleteOtp(userId);
      throw new ApiError(400, "OTP has expired");
    }

    if (String(otpData.otp) !== String(otpInput)) {
      throw new ApiError(400, "Invalid OTP");
    }

    await usersModel.markVerified(userId);
    deleteOtp(userId);

    return {
      message: "Account verified successfully",
    };
  },
};

module.exports = usersService;
