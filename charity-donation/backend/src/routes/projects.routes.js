const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projects.controller");
const donationsController = require("../controllers/donations.controller");
const projectUpdatesController = require("../controllers/project_updates.controller");
const authJwt = require("../middleware/authJwt");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");
const { createRateLimit } = require("../middleware/rateLimiter");

// Public endpoints for landing page
router.get("/newly-eligible", projectsController.getNewlyEligibleProjects);
router.get("/recent", projectsController.getRecentProjects);
router.get("/last-updated", projectsController.getLastUpdatedProjects);

// Public list
router.get("/", projectsController.getProjects);

// User & Founder — draft management
router.post("/", createRateLimit({ limit: 10 }), authJwt, requireRole("USER", "FOUNDER"), upload.single("coverImage"), projectsController.createProject);
router.get("/me", authJwt, requireRole("USER", "FOUNDER"), projectsController.getMyProjects);
router.put("/:id", authJwt, requireRole("USER", "FOUNDER"), upload.single("coverImage"), projectsController.updateMyProject);
router.delete("/:id", authJwt, requireRole("USER", "FOUNDER"), projectsController.deleteMyProject);
router.post("/:id/submit", createRateLimit({ limit: 10 }), authJwt, requireRole("USER", "FOUNDER"), projectsController.submitProject);
router.patch("/:id/stop", authJwt, requireRole("FOUNDER"), projectsController.stopProject);

// Founder only
router.get("/founder/me", authJwt, requireRole("FOUNDER"), projectsController.getFounderProjects);

// Project specific (public)
router.get("/:id", projectsController.getProjectById);
router.get("/:id/donations", projectsController.getDonationsByProjectId);
router.get("/:id/updates", projectUpdatesController.getByProjectId);

// Founder only — project updates
router.post("/:id/updates", authJwt, requireRole("FOUNDER"), upload.single("updateImage"), projectUpdatesController.create);

module.exports = router;
