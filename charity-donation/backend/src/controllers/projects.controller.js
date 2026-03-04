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
    const founderId = req.user.id;
    const payload = req.body;
    const data = await projectsService.createProject(founderId, payload);
    return created(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject
};