const projectUpdatesService = require("../services/project_updates.service");
const { ok } = require("../utils/response");

async function getAll(req, res, next) {
  try {
    const data = await projectUpdatesService.getProjectUpdates();
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await projectUpdatesService.getProjectUpdateById(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = {
      ...req.body,
      projectId: req.params.id,
      authorId: req.user ? req.user.id : req.body.authorId
    };
    const data = await projectUpdatesService.createProjectUpdate(payload);
    return ok(res, data, "Project update created successfully");
  } catch (err) {
    next(err);
  }
}

async function getByProjectId(req, res, next) {
  try {
    const data = await projectUpdatesService.getProjectUpdatesByProjectId(req.params.id);
    return ok(res, data, "Success");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getByProjectId, create };
