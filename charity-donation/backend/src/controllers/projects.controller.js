const projectsService = require("../services/projects.service");
const { ok, created } = require("../utils/response");
const { uploadImage } = require("../utils/cloudinary");

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

    // If file uploaded, upload to Cloudinary
    if (req.file) {
      const imageUrl = await uploadImage(req.file.buffer, "HopeFund/projects");
      payload.coverImageUrl = imageUrl;
    }

    const data = await projectsService.createProject(userId, payload);
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
async function getMyProjects(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await projectsService.getMyProjects(userId);
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
async function updateMyProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);
    const payload = req.body;

    // If file uploaded, upload to Cloudinary
    if (req.file) {
      const imageUrl = await uploadImage(req.file.buffer, "HopeFund/projects");
      payload.coverImageUrl = imageUrl;
    }

    const data = await projectsService.updateMyProject(
      userId,
      projectId,
      payload,
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

async function getLastUpdatedProjects(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await projectsService.getLastUpdatedProjects(limit);
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
