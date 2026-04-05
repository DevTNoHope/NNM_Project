const withdrawRequestsService = require("../services/withdraw_requests.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    let data;
    if (req.user.role === 'ADMIN') {
      data = await withdrawRequestsService.getWithdrawRequests();
    } else {
      data = await withdrawRequestsService.getWithdrawRequestsByFounder(req.user.id);
    }
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await withdrawRequestsService.getWithdrawRequestById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await withdrawRequestsService.createWithdrawRequest({
      ...req.body,
      founderId: req.user.id // From auth middleware
    });
    return ok(res, data, "Withdraw request created successfully");
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const { token } = req.query;
    const data = await withdrawRequestsService.verifyWithdrawal(token);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getBalance(req, res, next) {
  try {
    const { projectId, type } = req.query;
    const balance = await withdrawRequestsService.getAvailableBalance(Number(projectId), type);
    return ok(res, { balance }, "Success");
  } catch (err) {
    next(err);
  }
}

async function submitClaimTxHash(req, res, next) {
  try {
    const { requestId, txHash } = req.body;
    if (!requestId || !txHash) {
      return res.status(400).json({ message: "requestId and txHash are required" });
    }

    const withdrawRequestsModel = require("../models/withdraw_requests.model");
    const onchainClaimsModel = require("../models/onchain_claims.model");

    const request = await withdrawRequestsModel.findById(requestId);
    if (!request) return res.status(404).json({ message: "Withdraw request not found" });

    // Verify the request belongs to this founder
    if (request.founder_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Save tx_hash
    await onchainClaimsModel.create({
      withdraw_request_id: requestId,
      claim_tx_hash: txHash,
      status: 'CONFIRMED'
    });

    // Update status to CLAIMED
    await withdrawRequestsModel.updateStatus(requestId, 'CLAIMED');

    return ok(res, { txHash }, "Claim submitted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, verify, getBalance, submitClaimTxHash };
