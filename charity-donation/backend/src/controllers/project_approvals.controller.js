const projectApprovalsService = require("../services/project_approvals.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await projectApprovalsService.getProjectApprovals();
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await projectApprovalsService.getProjectApprovalById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await projectApprovalsService.createProjectApproval(req.body);
    return ok(res, data, "Project approval created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
