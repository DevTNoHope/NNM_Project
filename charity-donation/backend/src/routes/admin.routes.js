const express = require("express");
const adminController = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");
const badgeController = require("../controllers/badge.controller");//Thêm 
const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken, requireRole("ADMIN"));

router.get("/dashboard", adminController.getDashboard);
router.get("/projects", adminController.getAllProjects);
router.post("/projects/:id/approve", adminController.approveProjectRequest);
router.post("/projects/:id/reject", adminController.rejectProjectRequest);

// Quản lý Users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id/donations", adminController.getUserHistory);


// BADGES
router.get("/badges", badgeController.getAllBadges);
router.post("/badges", badgeController.createBadge);
router.put("/badges/:id", badgeController.updateBadge);
router.delete("/badges/:id", badgeController.deleteBadge);

module.exports = router;
