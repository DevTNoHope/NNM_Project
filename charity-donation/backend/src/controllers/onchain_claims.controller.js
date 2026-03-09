const onchainClaimsService = require("../services/onchain_claims.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await onchainClaimsService.getOnchainClaims();
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await onchainClaimsService.getOnchainClaimById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await onchainClaimsService.createOnchainClaim(req.body);
    return ok(res, data, "Onchain claim created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
