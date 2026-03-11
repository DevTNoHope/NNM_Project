const usersModel = require("../models/users.model");
const projectsModel = require("../models/projects.model");
const donationsModel = require("../models/donations.model");
const projectApprovalsModel = require("../models/project_approvals.model");
const ApiError = require("../utils/apiError");

async function getDashboardStats() {
  const totalUsers = await usersModel.countAll();
  const totalProjects = await projectsModel.countAll();
  const pendingProjects = await projectsModel.countByStatus("PENDING"); // Cập nhật từ DRAFT sang PENDING
  
  const donationStats = await donationsModel.getTotalDonations();

  return {
    users: {
      total: totalUsers
    },
    projects: {
      total: totalProjects,
      pending: pendingProjects
    },
    donations: {
      totalCount: donationStats.totalCount,
      totalAmount: donationStats.totalAmount
    }
  };
}

async function getAllAdminProjects() {
  // Fetch all projects regardless of status
  return projectsModel.findAll();
}

async function reviewProject(projectId, adminId, decision, note) {
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    throw new ApiError(400, "Decision must be either APPROVED or REJECTED");
  }

  const project = await projectsModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Save the approval decision note
  await projectApprovalsModel.create({
    projectId,
    adminId,
    decision,
    note
  });

  // Update the project status
  await projectsModel.updateStatus(projectId, decision);

  return { projectId, newStatus: decision };
}

async function getAllUsersWithStats() {
  return usersModel.findAllWithStats();
}

async function getUserDonationHistory(userId) {
  return usersModel.getUserDonationHistory(userId);
}

module.exports = {
  getDashboardStats,
  getAllAdminProjects,
  reviewProject,
  getAllUsersWithStats,
  getUserDonationHistory
};
