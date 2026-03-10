const usersModel = require("../models/users.model");
const projectsModel = require("../models/projects.model");
const donationsModel = require("../models/donations.model");
const projectApprovalsModel = require("../models/project_approvals.model");
const ApiError = require("../utils/apiError");

async function getDashboardStats() {
  const totalUsers = await usersModel.countAll();
  const totalProjects = await projectsModel.countAll();
  const pendingProjects = await projectsModel.countByStatus("DRAFT"); // Assuming DRAFT is pending approval
  
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

async function getPendingProjects() {
  // Fetch projects with DRAFT status (or whatever status represents pending review)
  return projectsModel.findByStatus("DRAFT");
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

module.exports = {
  getDashboardStats,
  getPendingProjects,
  reviewProject
};
