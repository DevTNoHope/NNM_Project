const ApiError = require("../utils/apiError");
const projectsModel = require("../models/projects.model");

async function getProjects() {
  return projectsModel.findAll();
}

async function getProjectById(id) {
  if (!Number.isFinite(id)) throw new ApiError(400, "Invalid project id");

  const project = await projectsModel.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  return project;
}

async function createProject(founderId, payload) {
  const { categoryId, title, description, goalAmount, coverImageUrl } = payload;

  if (!title || typeof title !== "string") {
    throw new ApiError(400, "Title is required");
  }
  if (!categoryId) throw new ApiError(400, "categoryId is required");
  if (!goalAmount || Number(goalAmount) <= 0) throw new ApiError(400, "goalAmount must be > 0");

  const newProjectId = await projectsModel.create({
    founderId,
    categoryId,
    title,
    description: description || null,
    goalAmount: Number(goalAmount),
    coverImageUrl: coverImageUrl || null
  });

  return { id: newProjectId };
}

module.exports = {
  getProjects,
  getProjectById,
  createProject
};