const donationsService = require("../services/donations.service");
const response = require("../utils/response");

async function donateToProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { amount, donationType, donorWallet, tokenAddress } = req.body;

    const ipAddr =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    const result = await donationsService.createDonation({
      projectId: Number(projectId),
      userId: Number(req.user.id),
      amount,
      donationType,
      donorWallet,
      tokenAddress,
      ipAddr,
    });

    return response.created(res, result, "Donation created successfully");
  } catch (error) {
    next(error);
  }
}




async function confirmCryptoDonation(req, res, next) {
  try {
    const { id } = req.params;
    const { txHash, donorWallet } = req.body;

    const result = await donationsService.confirmCryptoDonation(
      Number(id),
      Number(req.user.id),
      {
        txHash,
        donorWallet,
      },
    );

    return response.ok(res, result, "Crypto donation confirmed successfully");
  } catch (error) {
    next(error);
  }
}

async function vnpayReturn(req, res, next) {
  try {
    const result = await donationsService.handleVnpayReturn(req.query);

    const payment =
      result.responseCode === "00" && result.transactionStatus === "00"
        ? "success"
        : "failed";

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
    return res.redirect(
      `${clientUrl}/projects/${result.projectId}?payment=${payment}`,
    );
  } catch (error) {
    next(error);
  }
}

async function getDonationStatus(req, res, next) {
  try {
    const result = await donationsService.getDonationStatus(
      req.params.id,
      req.user.id,
    );

    return response.ok(res, result, "Donation status fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function getByProjectId(req, res, next) {
  try {
    const { id } = req.params;
    const data = await donationsService.getDonationsByProjectId(id);
    return response.ok(res, data, "Donations fetched successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  donateToProject,
  vnpayReturn,
  getDonationStatus,
  confirmCryptoDonation,
  getByProjectId
};
