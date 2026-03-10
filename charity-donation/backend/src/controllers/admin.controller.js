const adminService = require("../services/admin.service");
const { ok } = require("../utils/response");

async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return ok(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function getPendingProjects(req, res, next) {
  try {
    const projects = await adminService.getPendingProjects();
    return ok(res, projects, "Pending projects fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function reviewProjectRequest(req, res, next) {
  try {
    const { decision, note } = req.body;
    // For now, hardcode adminId or get from user context if available
    // Assuming req.user is populated by a middleware, fallback to 1 for testing if not present
    const adminId = req.user ? req.user.id : 1; 

    const result = await adminService.reviewProject(req.params.id, adminId, decision, note || "");
    return ok(res, result, `Project ${decision.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getPendingProjects,
  reviewProjectRequest
};
