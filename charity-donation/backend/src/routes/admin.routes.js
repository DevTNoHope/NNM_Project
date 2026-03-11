const express = require("express");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get("/dashboard", adminController.getDashboard);
router.get("/projects", adminController.getAllProjects);
router.post("/projects/:id/approve", adminController.approveProjectRequest);
router.post("/projects/:id/reject", adminController.rejectProjectRequest);

// Quản lý Users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id/donations", adminController.getUserHistory);

module.exports = router;
