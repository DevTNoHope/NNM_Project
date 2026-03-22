const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projects.controller");
const donationsController = require("../controllers/donations.controller");
const projectUpdatesController = require("../controllers/project_updates.controller");
const authJwt = require("../middleware/authJwt");
const upload = require("../middleware/upload");

// Public list
router.get("/", projectsController.getProjects);

// User draft management
router.post("/", authJwt, upload.single("coverImage"), projectsController.createProject);
router.get("/me", authJwt, projectsController.getMyProjects);
router.get("/founder/me", authJwt, projectsController.getFounderProjects);
router.put("/:id", authJwt, upload.single("coverImage"), projectsController.updateMyProject);
router.delete("/:id", authJwt, projectsController.deleteMyProject);
router.post("/:id/submit", authJwt, projectsController.submitProject);

// Project specific
router.get("/:id", projectsController.getProjectById);
router.get("/:id/donations", projectsController.getDonationsByProjectId);
//router.get("/:id/donations", donationsController.getByProjectId);
router.get("/:id/updates", projectUpdatesController.getByProjectId);

// Founder updates management
// We use a simplified POST which doesn't check if the user is the founder (the service should ideally do it)
router.post("/:id/updates", authJwt, upload.single("updateImage"), projectUpdatesController.create);

module.exports = router;
