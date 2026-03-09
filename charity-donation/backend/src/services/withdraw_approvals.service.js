const ApiError = require("../utils/apiError");
const withdrawApprovalsModel = require("../models/withdraw_approvals.model");

async function getWithdrawApprovals() {
  return withdrawApprovalsModel.findAll();
}

async function getWithdrawApprovalById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid approval id");

  const approval = await withdrawApprovalsModel.findById(id);
  if (!approval) throw new ApiError(404, "Withdraw approval not found");

  return approval;
}

async function createWithdrawApproval(payload) {
  const { withdrawRequestId, adminId, decision, adminSignature, nonce } = payload;
  if (!withdrawRequestId || !adminId || !decision) {
    throw new ApiError(400, "withdrawRequestId, adminId, and decision are required");
  }

  const newId = await withdrawApprovalsModel.create({ withdrawRequestId, adminId, decision, adminSignature, nonce });
  return { id: newId };
}

module.exports = {
  getWithdrawApprovals,
  getWithdrawApprovalById,
  createWithdrawApproval
};
