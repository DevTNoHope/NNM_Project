const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projects.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");

// Public
router.get("/", projectsController.getProjects);
router.get("/:id", projectsController.getProjectById);

// Founder/Admin tạo project (tuỳ bạn)
router.post(
  "/",
  authJwt,
  requireRole("FOUNDER", "ADMIN"),
  projectsController.createProject
);

module.exports = router;