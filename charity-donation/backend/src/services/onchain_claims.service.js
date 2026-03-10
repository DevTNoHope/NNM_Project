const ApiError = require("../utils/apiError");
const onchainClaimsModel = require("../models/onchain_claims.model");

async function getOnchainClaims() {
  return onchainClaimsModel.findAll();
}

async function getOnchainClaimById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid claim id");

  const claim = await onchainClaimsModel.findById(id);
  if (!claim) throw new ApiError(404, "Onchain claim not found");

  return claim;
}

async function createOnchainClaim(payload) {
  const { withdrawRequestId, claimTxHash } = payload;
  if (!withdrawRequestId) {
    throw new ApiError(400, "withdrawRequestId is required");
  }

  const newId = await onchainClaimsModel.create({ withdrawRequestId, claimTxHash });
  return { id: newId };
}

module.exports = {
  getOnchainClaims,
  getOnchainClaimById,
  createOnchainClaim
};
