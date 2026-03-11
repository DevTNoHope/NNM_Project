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

async function getAllProjects(req, res, next) {
  try {
    const projects = await adminService.getAllAdminProjects();
    return ok(res, projects, "All projects fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function approveProjectRequest(req, res, next) {
  try {
    const { note } = req.body;
    const adminId = req.user ? req.user.id : 1; 

    const result = await adminService.reviewProject(req.params.id, adminId, "APPROVED", note || "");
    return ok(res, result, "Project approved successfully");
  } catch (error) {
    next(error);
  }
}

async function rejectProjectRequest(req, res, next) {
  try {
    const { note } = req.body;
    const adminId = req.user ? req.user.id : 1; 

    // Reject bắt buộc phải có lý do (tùy chọn theo spec, nhưng ta cũng hỗ trợ "" nếu trống)
    const result = await adminService.reviewProject(req.params.id, adminId, "REJECTED", note || "");
    return ok(res, result, "Project rejected successfully");
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsersWithStats();
    return ok(res, users, "All users fetched successfully");
  } catch (error) {
    next(error);
  }
}

async function getUserHistory(req, res, next) {
  try {
    const history = await adminService.getUserDonationHistory(req.params.id);
    return ok(res, history, "User donation history fetched successfully");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getAllProjects,
  approveProjectRequest,
  rejectProjectRequest,
  getAllUsers,
  getUserHistory
};
