const ApiError = require("../utils/apiError");
const projectUpdatesModel = require("../models/project_updates.model");

async function getProjectUpdates() {
  return projectUpdatesModel.findAll();
}

async function getProjectUpdateById(id) {
  if (!Number.isFinite(Number(id))) throw new ApiError(400, "Invalid update id");

  const update = await projectUpdatesModel.findById(id);
  if (!update) throw new ApiError(404, "Project update not found");

  return update;
}

async function createProjectUpdate(payload) {
  const { projectId, authorId, title, content, imageUrl } = payload;
  if (!projectId || !authorId || !title || !content) {
    throw new ApiError(400, "projectId, authorId, title, and content are required");
  }

  const newId = await projectUpdatesModel.create({ projectId, authorId, title, content, imageUrl });
  return { id: newId };
}

module.exports = {
  getProjectUpdates,
  getProjectUpdateById,
  createProjectUpdate
};
