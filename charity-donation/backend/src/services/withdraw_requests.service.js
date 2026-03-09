const ApiError = require("../utils/apiError");
const withdrawRequestsModel = require("../models/withdraw_requests.model");

async function getWithdrawRequests() {
  return withdrawRequestsModel.findAll();
}

async function getWithdrawRequestById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid request id");

  const request = await withdrawRequestsModel.findById(id);
  if (!request) throw new ApiError(404, "Withdraw request not found");

  return request;
}

async function createWithdrawRequest(payload) {
  const { projectId, founderId, amount, note } = payload;
  if (!projectId || !founderId || !amount) {
    throw new ApiError(400, "projectId, founderId, and amount are required");
  }

  const newId = await withdrawRequestsModel.create({ projectId, founderId, amount, note });
  return { id: newId };
}

module.exports = {
  getWithdrawRequests,
  getWithdrawRequestById,
  createWithdrawRequest
};
