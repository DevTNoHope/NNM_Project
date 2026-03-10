const withdrawRequestsService = require("../services/withdraw_requests.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await withdrawRequestsService.getWithdrawRequests();
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
    const data = await withdrawRequestsService.createWithdrawRequest(req.body);
    return ok(res, data, "Withdraw request created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
