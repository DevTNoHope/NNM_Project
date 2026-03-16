const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projects.controller");
const authJwt = require("../middleware/authJwt");

// Public list
router.get("/", projectsController.getProjects);

// User draft management
router.post("/", authJwt, projectsController.createProject);
router.get("/me", authJwt, projectsController.getMyProjects);
router.get("/founder/me", authJwt, projectsController.getFounderProjects);
router.put("/:id", authJwt, projectsController.updateMyProject);
router.delete("/:id", authJwt, projectsController.deleteMyProject);
router.post("/:id/submit", authJwt, projectsController.submitProject);

// Public detail
router.get("/:id", projectsController.getProjectById);
router.get("/:id/donations", projectsController.getDonationsByProjectId);

module.exports = router;
