const ApiError = require("../utils/apiError");
const donationsModel = require("../models/donations.model");
const projectsModel = require("../models/projects.model");

async function createDonation(payload) {
  const { projectId, userId, amount, txHash } = payload;

  if (!projectId || !Number.isFinite(projectId)) throw new ApiError(400, "Invalid projectId");
  if (!userId || !Number.isFinite(userId)) throw new ApiError(400, "Invalid userId");
  if (!amount || Number(amount) <= 0) throw new ApiError(400, "amount must be > 0");
  if (!txHash) throw new ApiError(400, "txHash is required");

  // đảm bảo project tồn tại
  const project = await projectsModel.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // tạo donation
  const donationId = await donationsModel.create({
    projectId,
    userId,
    amount: Number(amount),
    txHash: String(txHash),
    chainId: payload.chainId || null,
    tokenAddress: payload.tokenAddress || null,
    donorWallet: payload.donorWallet || null,
    status: "PENDING"
  });

  return { id: donationId };
}

module.exports = { createDonation };