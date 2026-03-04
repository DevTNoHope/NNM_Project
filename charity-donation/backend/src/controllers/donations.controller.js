const donationsService = require("../services/donations.service");
const { created } = require("../utils/response");

async function donateToProject(req, res, next) {
  try {
    const projectId = Number(req.params.projectId);
    const userId = req.user.id;

    const { amount, txHash, chainId, tokenAddress, donorWallet } = req.body;

    const data = await donationsService.createDonation({
      projectId,
      userId,
      amount,
      txHash,
      chainId,
      tokenAddress,
      donorWallet
    });

    return created(res, data, "Donation created");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  donateToProject
};