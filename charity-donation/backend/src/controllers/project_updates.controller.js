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
    const data = await projectUpdatesService.createProjectUpdate(req.body);
    return ok(res, data, "Project update created successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
