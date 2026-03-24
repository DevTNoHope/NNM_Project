const ApiError = require("../utils/apiError");
const projectsModel = require("../models/projects.model");
const donationsModel = require("../models/donations.model");

const EDITABLE_STATUSES = ["DRAFT", "REJECTED"];

function validateProjectPayload(payload) {
  const { categoryId, title, goalAmount } = payload;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!categoryId) {
    throw new ApiError(400, "categoryId is required");
  }

  if (!goalAmount || Number(goalAmount) <= 0) {
    throw new ApiError(400, "goalAmount must be > 0");
  }
}

async function getProjects() {
  return projectsModel.findPublished();
}

async function getProjectById(id) {
  if (!Number.isFinite(id)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await projectsModel.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

async function createProject(userId, payload) {
  validateProjectPayload(payload);

  const { categoryId, title, description, goalAmount, coverImageUrl } = payload;

  const newProjectId = await projectsModel.create({
    founderId: userId,
    categoryId,
    title: title.trim(),
    description: description || null,
    goalAmount: Number(goalAmount),
    coverImageUrl: coverImageUrl || null,
  });

  return {
    id: newProjectId,
    status: "DRAFT",
    message: "Project draft created successfully",
  };
}

async function getMyProjects(userId) {
  return projectsModel.findOwnedByUser(userId);
}

async function updateMyProject(userId, projectId, payload) {
  if (!Number.isFinite(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  validateProjectPayload(payload);

  const project = await projectsModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.founder_id !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to update this project",
    );
  }

  if (!EDITABLE_STATUSES.includes(project.status)) {
    throw new ApiError(
      400,
      "Only projects in DRAFT or REJECTED status can be updated directly",
    );
  }

  await projectsModel.updateById(projectId, {
    categoryId: payload.categoryId,
    title: payload.title.trim(),
    description: payload.description || null,
    goalAmount: Number(payload.goalAmount),
    coverImageUrl: payload.coverImageUrl || null,
  });

  return { message: "Project updated successfully" };
}

async function deleteMyProject(userId, projectId) {
  if (!Number.isFinite(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await projectsModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.founder_id !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to delete this project",
    );
  }

  if (!EDITABLE_STATUSES.includes(project.status)) {
    throw new ApiError(
      400,
      "Only projects in DRAFT or REJECTED status can be deleted",
    );
  }

  await projectsModel.deleteById(projectId);
  return { message: "Project deleted successfully" };
}

async function submitProject(userId, projectId) {
  if (!Number.isFinite(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await projectsModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.founder_id !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to submit this project",
    );
  }

  if (!EDITABLE_STATUSES.includes(project.status)) {
    throw new ApiError(
      400,
      "Only projects in DRAFT or REJECTED status can be submitted",
    );
  }

  await projectsModel.updateStatus(projectId, "PENDING");

  // Send realtime notification to Admin
  try {
    const notificationsModel = require("../models/notifications.model");
    const { getIO } = require("../utils/socket");
    const notification = await notificationsModel.createNotification({
      userId: null,
      title: "New Project Submitted",
      message: `Project "${project.title}" has been submitted for review.`,
      type: "PROJECT_SUBMITTED",
      relatedId: projectId
    });
    getIO().to("admin_room").emit("new_notification", notification);
  } catch (err) {
    console.error("Failed to send notification:", err);
  }

  return {
    message: "Project submitted for admin review",
    status: "PENDING",
  };
}

async function getFounderProjects(userId) {
  return projectsModel.findFounderProjects(userId);
}

async function getDonationsByProjectId(projectId) {
  return donationsModel.getDonationsByProjectId(projectId);
}

async function getNewlyEligibleProjects(page = 0, limit = 3) {
  const totalItems = await projectsModel.countPublished();
  const offset = page * limit;
  const projects = await projectsModel.findNewlyEligible(limit, offset);
  
  const totalPages = Math.ceil(totalItems / limit);

  return {
    projects,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit
    }
  };
}

async function getRecentProjects(limit = 3) {
  return projectsModel.findRecent(limit);
}

async function getLastUpdatedProjects(limit = 10) {
  return projectsModel.findLastUpdated(limit);
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  getNewlyEligibleProjects,
  getRecentProjects,
  getLastUpdatedProjects,
  getMyProjects,
  updateMyProject,
  deleteMyProject,
  submitProject,
  getFounderProjects,
  getDonationsByProjectId,
};
