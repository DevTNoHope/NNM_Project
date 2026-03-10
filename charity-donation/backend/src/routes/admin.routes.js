const express = require("express");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/dashboard", adminController.getDashboard);
router.get("/projects/pending", adminController.getPendingProjects);
router.post("/projects/:id/review", adminController.reviewProjectRequest);

module.exports = router;
