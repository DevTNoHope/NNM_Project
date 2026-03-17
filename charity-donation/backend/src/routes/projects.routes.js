const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projects.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

// Public endpoints for landing page
router.get("/newly-eligible", projectsController.getNewlyEligibleProjects);
router.get("/recent", projectsController.getRecentProjects);
router.get("/last-updated", projectsController.getLastUpdatedProjects);

// Existing endpoints
router.get("/", projectsController.getProjects);
router.get("/:id", projectsController.getProjectById);

// Founder/Admin tạo project
router.post(
  "/",
  authJwt,
  requireRole("FOUNDER", "ADMIN"),
  projectsController.createProject
);

module.exports = router;