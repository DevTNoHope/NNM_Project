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

async function getNewlyEligibleProjects(req, res, next) {
  try {
    const page = req.query.page ? Number(req.query.page) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const data = await projectsService.getNewlyEligibleProjects(page, limit);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getRecentProjects(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 3;
    const data = await projectsService.getRecentProjects(limit);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getLastUpdatedProjects(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await projectsService.getLastUpdatedProjects(limit);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  getNewlyEligibleProjects,
  getRecentProjects,
  getLastUpdatedProjects
};