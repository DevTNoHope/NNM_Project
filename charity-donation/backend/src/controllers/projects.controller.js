const projectsService = require("../services/projects.service");
const { ok, created } = require("../utils/response");

async function getProjects(req, res, next) {
  try {
    const data = await projectsService.getProjects();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getProjectById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = await projectsService.getProjectById(id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const data = await projectsService.createProject(userId, payload);
    return created(res, data);
  } catch (err) {
    next(err);
  }
}

async function getMyProjects(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await projectsService.getMyProjects(userId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function updateMyProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);
    const data = await projectsService.updateMyProject(
      userId,
      projectId,
      req.body,
    );
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function deleteMyProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);
    const data = await projectsService.deleteMyProject(userId, projectId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function submitProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);
    const data = await projectsService.submitProject(userId, projectId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getFounderProjects(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await projectsService.getFounderProjects(userId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getDonationsByProjectId(req, res, next) {
  try {
    const projectId = Number(req.params.id);
    const data = await projectsService.getDonationsByProjectId(projectId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  getMyProjects,
  updateMyProject,
  deleteMyProject,
  submitProject,
  getFounderProjects,
  getDonationsByProjectId,
};
