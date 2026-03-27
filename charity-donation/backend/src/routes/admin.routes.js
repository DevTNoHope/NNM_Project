const express = require("express");
const adminController = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

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

// Create Vault (IPFS + Deploy)
router.post("/projects/:id/create-vault", adminController.createVault);

// Badges management
router.post("/badges", adminController.createBadge);
router.put("/badges/:id", adminController.updateBadge);
router.delete("/badges/:id", adminController.deleteBadge);
router.get("/badges", adminController.getAllBadges);

module.exports = router;
