const ApiError = require("../utils/apiError");
const projectApprovalsModel = require("../models/project_approvals.model");

async function getProjectApprovals() {
  return projectApprovalsModel.findAll();
}

async function getProjectApprovalById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid approval id");

  const approval = await projectApprovalsModel.findById(id);
  if (!approval) throw new ApiError(404, "Project approval not found");

  return approval;
}

async function createProjectApproval(payload) {
  const { projectId, adminId, decision, note } = payload;
  if (!projectId || !adminId || !decision) {
    throw new ApiError(400, "projectId, adminId, and decision are required");
  }

  const newId = await projectApprovalsModel.create({ projectId, adminId, decision, note });
  return { id: newId };
}

module.exports = {
  getProjectApprovals,
  getProjectApprovalById,
  createProjectApproval
};
