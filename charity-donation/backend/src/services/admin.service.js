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

  // If approved, upgrade the user role from USER to FOUNDER
  if (decision === "APPROVED") {
    await usersModel.updateRole(project.founder_id, "FOUNDER");
  }

  // Send notification to Founder
  try {
    const notificationsModel = require("../models/notifications.model");
    const { getIO } = require("../utils/socket");
    const notification = await notificationsModel.createNotification({
      userId: project.founder_id,
      title: decision === "APPROVED" ? "Project Approved" : "Project Rejected",
      message: `Your project "${project.title}" has been ${decision.toLowerCase()}.`,
      type: "PROJECT_REVIEWED",
      relatedId: projectId
    });
    getIO().to(`user_${project.founder_id}`).emit("new_notification", notification);
    
    // Send email to Founder
    const founder = await usersModel.findById(project.founder_id);
    if (founder && founder.email) {
      const { sendMail } = require("../utils/mailer");
      await sendMail({
        to: founder.email,
        subject: `[HopeFund] Project ${decision === "APPROVED" ? "Approved" : "Rejected"}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: ${decision === "APPROVED" ? "#10b981" : "#ef4444"}; margin-bottom: 20px;">
              Project ${decision === "APPROVED" ? "Approved 🎉" : "Rejected"}
            </h2>
            <p>Hello <strong>${founder.name || 'Founder'}</strong>,</p>
            <p>Your project <strong>${project.title}</strong> has been reviewed by the Admin.</p>
            <p><strong>Status:</strong> ${decision}</p>
            ${note ? `<p><strong>Admin Note:</strong> ${note}</p>` : ''}
            <p>Thank you,<br/>The HopeFund Team</p>
          </div>
        `
      });
    }
  } catch (error) {
    console.error("Failed to send review notification:", error);
  }

  return { projectId, newStatus: decision };
}

async function getAllUsersWithStats() {
  return usersModel.findAllWithStats();
}

async function getUserDonationHistory(userId) {
  return usersModel.getDonationsByUserId(userId);
}

module.exports = {
  getDashboardStats,
  getAllAdminProjects,
  reviewProject,
  getAllUsersWithStats,
  getUserDonationHistory
};
