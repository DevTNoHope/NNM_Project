const withdrawApprovalsService = require("../services/withdraw_approvals.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await withdrawApprovalsService.getWithdrawApprovals();
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await withdrawApprovalsService.getWithdrawApprovalById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await withdrawApprovalsService.createWithdrawApproval(req.body);
    return ok(res, data, "Withdraw approval created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
